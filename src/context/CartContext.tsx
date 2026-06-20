'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { CartItem, SellerProduct, PodProduct } from '@/types/database'

export interface CartItemWithProduct extends CartItem {
  seller_product: SellerProduct & {
    pod_product?: PodProduct
  }
  seller_name?: string
  seller_id?: string
}

interface CartContextType {
  items: CartItemWithProduct[]
  itemCount: number
  subtotal: number
  loading: boolean
  addItem: (sellerProductId: string, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  groupedBySeller: { sellerId: string; sellerName: string; items: CartItemWithProduct[] }[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const getSessionId = () => {
    if (typeof window === 'undefined') return null
    let sessionId = sessionStorage.getItem('guest_cart_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('guest_cart_session', sessionId)
    }
    return sessionId
  }

  const loadCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('cart_items')
      .select('*, seller_product:seller_products(*, pod_product:pod_products(*))')

    if (user) {
      query = query.eq('cart_owner_id', user.id)
    } else {
      const sessionId = getSessionId()
      if (!sessionId) {
        setItems([])
        setLoading(false)
        return
      }
      query = query.eq('guest_session_id', sessionId)
    }

    const { data } = await query

    if (data) {
      const enriched = await Promise.all(
        data.map(async (item: any) => {
          if (item.seller_product?.seller_id) {
            const { data: sellerProfile } = await supabase
              .from('seller_profiles')
              .select('storefront_name')
              .eq('id', item.seller_product.seller_id)
              .single()

            return {
              ...item,
              seller_name: sellerProfile?.storefront_name || 'Unknown Seller',
              seller_id: item.seller_product.seller_id,
            }
          }
          return item
        })
      )
      setItems(enriched)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = async (sellerProductId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser()

    const existingItem = items.find(
      (i) => i.seller_product_id === sellerProductId &&
        (user ? i.cart_owner_id === user.id : i.guest_session_id === getSessionId())
    )

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity)
      return
    }

    const payload: any = { seller_product_id: sellerProductId, quantity }
    if (user) {
      payload.cart_owner_id = user.id
    } else {
      payload.guest_session_id = getSessionId()
    }

    await supabase.from('cart_items').insert(payload)
    await loadCart()
  }

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    await loadCart()
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    await loadCart()
  }

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('cart_items').delete().eq('cart_owner_id', user.id)
    } else {
      const sessionId = getSessionId()
      if (sessionId) {
        await supabase.from('cart_items').delete().eq('guest_session_id', sessionId)
      }
    }
    setItems([])
  }

  const groupedBySeller = items.reduce((acc, item) => {
    const sellerId = item.seller_id || 'unknown'
    const existing = acc.find((g) => g.sellerId === sellerId)
    if (existing) {
      existing.items.push(item)
    } else {
      acc.push({ sellerId, sellerName: item.seller_name || 'Unknown Seller', items: [item] })
    }
    return acc
  }, [] as { sellerId: string; sellerName: string; items: CartItemWithProduct[] }[])

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.seller_product?.seller_price || 0) * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        groupedBySeller,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

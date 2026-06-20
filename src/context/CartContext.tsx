'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase-client'
import { getDemoProducts } from '@/lib/demo-data'
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

const LOCAL_CART_KEY = 'fotoluv_local_cart'

function getLocalCart(): CartItemWithProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function setLocalCart(items: CartItemWithProduct[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items)) } catch {}
}

async function buildDemoCartItem(): Promise<CartItemWithProduct> {
  const demo = (await getDemoProducts())[0]
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
    cart_owner_id: null,
    guest_session_id: 'local',
    seller_product_id: 'demo',
    quantity: 1,
    created_at: new Date().toISOString(),
    seller_product: {
      id: 'demo',
      seller_id: 'demo-seller',
      media_id: 'demo-media',
      pod_product_id: 'demo-pod',
      selected_variant: null,
      seller_price: demo?.seller_price || 39.99,
      mockup_url: demo?.mockup_url || '/images/placeholder-1.svg',
      is_published: true,
      created_at: new Date().toISOString(),
      pod_product: { id: 'demo-pod', printful_product_id: null, category: 'wall_art', name: demo?.pod_product?.name || 'Canvas Print', base_cost: 15, available_sizes: [], available_variants: [], is_active: true, synced_at: new Date().toISOString() },
    },
    seller_name: 'Demo Artist',
    seller_id: 'demo-seller',
  }
}

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
    const localCart = getLocalCart()
    if (localCart.length > 0) {
      setItems(localCart)
      setLoading(false)
      return
    }

    try {
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

      if (data && data.length > 0) {
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
        setLocalCart(enriched)
      }
    } catch {
      const local = getLocalCart()
      if (local.length > 0) setItems(local)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = async (sellerProductId: string, quantity = 1) => {
    const localCart = getLocalCart()
    const existingLocal = localCart.find((i) => i.seller_product_id === sellerProductId)
    if (existingLocal) {
      const updated = localCart.map((i) =>
        i.seller_product_id === sellerProductId ? { ...i, quantity: i.quantity + quantity } : i
      )
      setLocalCart(updated)
      setItems(updated)
      return
    }

    const demoItem = await buildDemoCartItem()
    const newItem = { ...demoItem, seller_product_id: sellerProductId, quantity }
    const updated = [...localCart, newItem]
    setLocalCart(updated)
    setItems(updated)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload: any = { seller_product_id: sellerProductId, quantity }
      if (user) payload.cart_owner_id = user.id
      else payload.guest_session_id = getSessionId()
      await supabase.from('cart_items').insert(payload)
    } catch {
      // Local cart is already set — this is the fallback
    }
  }

  const removeItem = async (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId)
    setLocalCart(updated)
    setItems(updated)

    try {
      await supabase.from('cart_items').delete().eq('id', itemId)
    } catch { /* local fallback */ }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }
    const updated = items.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    setLocalCart(updated)
    setItems(updated)

    try {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    } catch { /* local fallback */ }
  }

  const clearCart = async () => {
    setLocalCart([])
    setItems([])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('cart_items').delete().eq('cart_owner_id', user.id)
      } else {
        const sessionId = getSessionId()
        if (sessionId) await supabase.from('cart_items').delete().eq('guest_session_id', sessionId)
      }
    } catch { /* local fallback */ }
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

export interface MeasurementField {
  key: string
  label: string
  description: string
  placeholder: string
  required: boolean
}

export const MEASUREMENT_FIELDS: Record<string, MeasurementField[]> = {
  dress: [
    { key: 'bust', label: 'Bust', description: 'Around the fullest part of the chest', placeholder: 'e.g. 92', required: true },
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part of the waist', placeholder: 'e.g. 76', required: true },
    { key: 'hip', label: 'Hip', description: 'Around the fullest part of the hips', placeholder: 'e.g. 98', required: true },
    { key: 'shoulder_width', label: 'Shoulder Width', description: 'Across the back from shoulder to shoulder', placeholder: 'e.g. 40', required: true },
    { key: 'sleeve_length', label: 'Sleeve Length', description: 'From shoulder point to wrist', placeholder: 'e.g. 60', required: true },
    { key: 'dress_length', label: 'Dress Length', description: 'From shoulder to desired hemline', placeholder: 'e.g. 110', required: true },
    { key: 'height', label: 'Height', description: 'Your total height', placeholder: 'e.g. 170', required: true },
  ],
  top: [
    { key: 'bust', label: 'Bust / Chest', description: 'Around the fullest part', placeholder: 'e.g. 96', required: true },
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part', placeholder: 'e.g. 80', required: true },
    { key: 'shoulder_width', label: 'Shoulder Width', description: 'Across the back shoulder to shoulder', placeholder: 'e.g. 44', required: true },
    { key: 'sleeve_length', label: 'Sleeve Length', description: 'From shoulder point to wrist', placeholder: 'e.g. 62', required: true },
    { key: 'neck', label: 'Neck', description: 'Around the base of the neck', placeholder: 'e.g. 38', required: true },
    { key: 'armhole', label: 'Armhole', description: 'Around the top of the arm at the shoulder', placeholder: 'e.g. 42', required: false },
  ],
  trousers: [
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part', placeholder: 'e.g. 82', required: true },
    { key: 'hip', label: 'Hip', description: 'Around the fullest part', placeholder: 'e.g. 100', required: true },
    { key: 'inseam', label: 'Inseam', description: 'From crotch to ankle hem', placeholder: 'e.g. 78', required: true },
    { key: 'outseam', label: 'Outseam', description: 'From waist to ankle hem along outer leg', placeholder: 'e.g. 104', required: true },
    { key: 'thigh', label: 'Thigh', description: 'Around the fullest part of the thigh', placeholder: 'e.g. 58', required: false },
    { key: 'knee', label: 'Knee', description: 'Around the knee', placeholder: 'e.g. 38', required: false },
    { key: 'ankle', label: 'Ankle', description: 'Around the ankle', placeholder: 'e.g. 26', required: false },
  ],
  skirt: [
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part', placeholder: 'e.g. 76', required: true },
    { key: 'hip', label: 'Hip', description: 'Around the fullest part', placeholder: 'e.g. 98', required: true },
    { key: 'skirt_length', label: 'Skirt Length', description: 'From waist to desired hemline', placeholder: 'e.g. 80', required: true },
  ],
  shirt: [
    { key: 'chest', label: 'Chest', description: 'Around the fullest part of the chest', placeholder: 'e.g. 100', required: true },
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part', placeholder: 'e.g. 88', required: true },
    { key: 'shoulder_width', label: 'Shoulder Width', description: 'Across the back shoulder to shoulder', placeholder: 'e.g. 46', required: true },
    { key: 'sleeve_length', label: 'Sleeve Length', description: 'From shoulder point to wrist', placeholder: 'e.g. 64', required: true },
    { key: 'neck', label: 'Neck', description: 'Around the base of the neck', placeholder: 'e.g. 40', required: true },
    { key: 'armhole', label: 'Armhole', description: 'Around the top of the arm at the shoulder', placeholder: 'e.g. 44', required: false },
  ],
  jacket: [
    { key: 'chest', label: 'Chest', description: 'Around the fullest part', placeholder: 'e.g. 104', required: true },
    { key: 'waist', label: 'Waist', description: 'Around the narrowest part', placeholder: 'e.g. 90', required: true },
    { key: 'hip', label: 'Hip', description: 'Around the fullest part of hips', placeholder: 'e.g. 102', required: true },
    { key: 'shoulder_width', label: 'Shoulder Width', description: 'Across the back shoulder to shoulder', placeholder: 'e.g. 48', required: true },
    { key: 'sleeve_length', label: 'Sleeve Length', description: 'From shoulder point to wrist', placeholder: 'e.g. 66', required: true },
    { key: 'neck', label: 'Neck', description: 'Around the base of the neck', placeholder: 'e.g. 42', required: true },
  ],
}

export const GARMENT_CATEGORIES = [
  { value: 'dress', label: 'Dress' },
  { value: 'top', label: 'Top / Blouse' },
  { value: 'shirt', label: 'Shirt' },
  { value: 'trousers', label: 'Trousers / Pants' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'jacket', label: 'Jacket / Blazer' },
]

export const BODY_DIAGRAMS: Record<string, string> = {
  dress: '/images/measurement-guide-dress.svg',
  top: '/images/measurement-guide-top.svg',
  shirt: '/images/measurement-guide-shirt.svg',
  trousers: '/images/measurement-guide-trousers.svg',
  skirt: '/images/measurement-guide-skirt.svg',
  jacket: '/images/measurement-guide-jacket.svg',
}

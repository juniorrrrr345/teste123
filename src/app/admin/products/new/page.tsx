import ProductForm from '@/components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau Produit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez un nouveau produit à votre catalogue
        </p>
      </div>

      <ProductForm />
    </div>
  )
}
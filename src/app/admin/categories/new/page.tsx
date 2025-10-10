import CategoryForm from '@/components/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Catégorie</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez une nouvelle catégorie à votre catalogue
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
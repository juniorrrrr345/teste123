import FarmForm from '@/components/FarmForm'

export default function NewFarmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Ferme</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez une nouvelle ferme à votre catalogue
        </p>
      </div>

      <FarmForm />
    </div>
  )
}
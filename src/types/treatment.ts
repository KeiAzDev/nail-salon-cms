interface TreatmentService {
  id: number
  name: string
  price: number
}

interface TreatmentServices {
  menuIds: number[]
  completedServices: TreatmentService[]
}

interface TreatmentProducts {
  items: string[]
}
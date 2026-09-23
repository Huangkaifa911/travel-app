import request from '@/utils/request'

export const saveTripPlan = (data) => {
  return request.post('/tripPlans', data)
}

export const listTripPlan = () => {
  return request.get('/tripPlans')
}

export const getTripPlanDetail = (id) => {
  return request.get(`/tripPlans/${id}`)
}

export const deleteTripPlan = (id) => {
  return request.delete(`/tripPlans/${id}`)
}

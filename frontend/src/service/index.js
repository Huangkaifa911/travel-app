import request from '../utils/request'

export const getCityList = () => {
  return request({
    url: 'travel/cities',
    method: 'get',
  })
}

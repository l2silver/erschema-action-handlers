// @flow
import {OrderedSet, Map, Record} from 'immutable'
import {relationshipTypes} from 'erschema'
const {ONE, MANY} = relationshipTypes
type $modelGenerator = (ent: Object)=>Class<any>
type $location = string[];

const getRelationshipType = (mapOfRelationshipTypes: Object, mapOfRelationshipTypesById?: Object, id: string | number, relationshipName: string)=>{
  if(mapOfRelationshipTypesById){
    return mapOfRelationshipTypesById[id][relationshipName]
  }
  return mapOfRelationshipTypes[relationshipName]
}
export default {
  link(mapOfRelationshipTypes: Object, mapOfRelationshipTypesById?: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = getRelationshipType(mapOfRelationshipTypes, mapOfRelationshipTypesById, id, relationshipName)
      if (relationshipType === MANY){
        return state.updateIn([relationshipName, `${id}`], (ids: any) => {
          if(ids){
            return ids.add(relationshipValue)
          }
          return new OrderedSet([relationshipValue])
        })
      }
      return state.setIn([relationshipName, `${id}`], relationshipValue)
    }
  },
  createRelationship(mapOfRelationshipTypes: Object, mapOfRelationshipTypesById?: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = getRelationshipType(mapOfRelationshipTypes, mapOfRelationshipTypesById, id, relationshipName)
      if (relationshipType === MANY){
        return state.setIn([relationshipName, `${id}`], new OrderedSet([relationshipValue]))
      }
      return state.setIn([relationshipName, `${id}`], relationshipValue)
    }
  },
  
  unlink(mapOfRelationshipTypes: Object, mapOfRelationshipTypesById?: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = getRelationshipType(mapOfRelationshipTypes, mapOfRelationshipTypesById, id, relationshipName)
      if (relationshipType === MANY){
        return state.updateIn([relationshipName, `${id}`], (ids: any) => {
          if(ids){
            return ids.remove(relationshipValue)
          }
          return new OrderedSet()
        })
      }
      return state.setIn([relationshipName, `${id}`], 0)
    }
  },

  indexRelationship(mapOfRelationshipTypes: Object, mapOfRelationshipTypesById?: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {name, idValuePairs} = payload.relationships
      let relationshipType = mapOfRelationshipTypes[name]
      return state.updateIn([name], relationships=>{
        idValuePairs.reduce((finalResult, {id, value})=>{
          if(mapOfRelationshipTypesById){
            relationshipType =  getRelationshipType(mapOfRelationshipTypes, mapOfRelationshipTypesById, id, name)
          }
          const finalValue = relationshipType === MANY ? new OrderedSet(value) : value
          finalResult.set(`id`, finalValue)
          return finalResult
        }, relationships)
      })
    }
  },
  remove(mapOfRelationshipTypes: Object, relationshipNames: string[][], mapOfRelationshipTypesById?: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {id} = payload
      return relationshipNames.reduce((finalResult, [relationshipName, page])=>{
        const relationshipType = getRelationshipType(mapOfRelationshipTypes, mapOfRelationshipTypesById, id, relationshipName)
        if(page){
          if (relationshipType === MANY){
            return finalResult.updateIn([relationshipName, page], (ids: OrderedSet<number | string>) => {
              return ids && ids.delete(id)
            })
          }
          return finalResult.updateIn([relationshipName, page], (idValue: Map<string, number | string>) => {
            return idValue === id ? 0 : idValue
          })
        }
        if (relationshipType === MANY){
          return finalResult.updateIn([relationshipName], (mapOfIds: Map<string, OrderedSet<number | string>>) => {
            return mapOfIds.map(ids=>ids && ids.delete(id))
          })
        }
        return finalResult.updateIn([relationshipName], (mapOfIds: Map<string, number | string>) => {
          return mapOfIds.map(idValue=>idValue === id ? 0 : idValue)
        })
      }, state)
    }
  },
  
}

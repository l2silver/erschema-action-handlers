// @flow
import {Map} from 'immutable'
import {handleActions} from 'redux-actions'
import actionNames from 'resource-action-types'
import {relationshipTypes} from 'erschema'
import handlers from './handlers'
import generateDefaultState from '../generateDefaultState'
const {ONE, MANY} = relationshipTypes

type $relationshipSchema = {
  name: string;
  type: number;
  relationshipName: string;
}

type $props = {
  name: string,
  defaultStateConfig?: Object,
	options?: Object,
  otherActions?: Object,
  locationPath?: string[],
  relationships: $relationshipSchema[]
};

function getMapOfRelationshipDefaultValues(relationships){
  return relationships.reduce((finalResult, {relationshipName}) => {
    finalResult[relationshipName] = new Map()
    return finalResult
  }, {})
}

function getMapOfRelationshipTypes(relationships){
  return relationships.reduce((finalResult, {relationshipName, type})=>{
    finalResult[relationshipName] = type
    return finalResult
  }, {})
}

function getMapOfRelationships(relationships){
  return relationships.reduce((finalResult: Object, {name, relationshipName})=>{
    if(!finalResult[name]){
      finalResult[name] = []
    }
    finalResult[name].push(relationshipName)
    return finalResult
  }, {})
}

export default function ({name, relationships, defaultStateConfig = {}, otherActions = {}}: $props) {
  const mapOfRelationshipDefaultValues = getMapOfRelationshipDefaultValues(relationships)
  const mapOfRelationshipTypes = getMapOfRelationshipTypes(relationships)
  const mapOfRelationships = getMapOfRelationships(relationships)
  const removeActions = Object.keys(mapOfRelationships).reduce((finalResult, relatedEntityName)=>{
    finalResult[actionNames.remove(relatedEntityName)] = handlers.remove(mapOfRelationshipTypes, mapOfRelationships, relatedEntityName)
    return finalResult
  }, {})
  return handleActions(
    {
      [actionNames.link(name)]: handlers.link(mapOfRelationshipTypes),
      [actionNames.unlink(name)]: handlers.unlink(mapOfRelationshipTypes),
      [actionNames.createRelationship(name)]: handlers.createRelationship(mapOfRelationshipTypes),
      [actionNames.indexRelationship(name)]: handlers.indexRelationship(mapOfRelationshipTypes),
      ...removeActions,
      ...otherActions
    },
    generateDefaultState({...mapOfRelationshipDefaultValues, ...defaultStateConfig}))
}
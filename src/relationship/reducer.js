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

type $coreProps = {
  name: string,
  defaultStateConfig?: Object,
	options?: Object,
  otherActions?: Object,
  locationPath?: string[],
};

type $props = $coreProps & {
  relationships: $relationshipSchema[]
}

type $pageProps = $coreProps & {
  relationships: {[key: string]: $relationshipSchema[]}
}

function getMapOfRelationshipDefaultValues(relationships, startValue = {}){
  return relationships.reduce((finalResult, {relationshipName}) => {
    finalResult[relationshipName] = new Map()
    return finalResult
  }, startValue)
}

function getMapOfRelationshipTypes(relationships){
  return relationships.reduce((finalResult, {relationshipName, type})=>{
    finalResult[relationshipName] = type
    return finalResult
  }, {})
}

function getMapOfRelationships(relationships, startValue = {}, page){
  return relationships.reduce((finalResult: Object, {name, relationshipName})=>{
    if(!finalResult[name]){
      finalResult[name] = []
    }
    finalResult[name].push(page ? [relationshipName, page] : [relationshipName])
    return finalResult
  }, startValue)
}

export default function ({name, relationships, defaultStateConfig = {}, otherActions = {}}: $props) {
  const mapOfRelationshipDefaultValues = getMapOfRelationshipDefaultValues(relationships)
  const mapOfRelationshipTypes = getMapOfRelationshipTypes(relationships)
  const mapOfRelationships = getMapOfRelationships(relationships)
  const removeActions = Object.keys(mapOfRelationships).reduce((finalResult, relatedEntityName)=>{
    finalResult[actionNames.remove(relatedEntityName)] = handlers.remove(mapOfRelationshipTypes, mapOfRelationships[relatedEntityName])
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

export function relationshipPageReducer({name, relationships, defaultStateConfig = {}, otherActions = {}}: $pageProps) {
  const mapOfRelationshipDefaultValues = Object.keys(relationships).reduce((finalResult, page)=>{
    return getMapOfRelationshipDefaultValues(relationships[page], finalResult)
  }, {})
  
  const mapOfRelationshipTypes = Object.keys(relationships).reduce((finalResult, page)=>{
    finalResult[page] = getMapOfRelationshipTypes(relationships[page])
    return finalResult
  }, {})
  const mapOfRelationships = Object.keys(relationships).reduce((finalResult, page)=>{
    return getMapOfRelationships(relationships[page], finalResult, page)
  }, {})
  const removeActions = Object.keys(mapOfRelationships).reduce((finalResult, relatedEntityName)=>{
    finalResult[actionNames.remove(relatedEntityName)] = handlers.remove({}, mapOfRelationships[relatedEntityName], mapOfRelationshipTypes)
    return finalResult
  }, {})
  return handleActions(
    {
      [actionNames.link(name)]: handlers.link({}, mapOfRelationshipTypes),
      [actionNames.unlink(name)]: handlers.unlink({}, mapOfRelationshipTypes),
      [actionNames.createRelationship(name)]: handlers.createRelationship({}, mapOfRelationshipTypes),
      [actionNames.indexRelationship(name)]: handlers.indexRelationship({}, mapOfRelationshipTypes),
      ...removeActions,
      ...otherActions
    },
    generateDefaultState({...mapOfRelationshipDefaultValues, ...defaultStateConfig}))
}
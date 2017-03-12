// @flow
import {createAction} from 'redux-actions'
import actionNames from 'resource-action-types'

type $id = string | number
type $relationship = {
  relationshipName: string,
  id: $id,
  relationshipValue: $id | $id[]
}

type $relationships = {
  name: string;
  relationshipName: string;
  idValuePairs: Array<{id: $id, value: $id | $id[]}>;
}

export default {
  link(entityName: string, relationship: $relationship) {
    if (relationship instanceof Error) {
      return createAction(actionNames.link(entityName))(relationship)
    }
    return createAction(actionNames.link(entityName))({relationship})
  },
  unlink(entityName: string, relationship: $relationship) {
    if (relationship instanceof Error) {
      return createAction(actionNames.unlink(entityName))(relationship)
    }
    return createAction(actionNames.unlink(entityName))({relationship})
  },
  indexRelationship(entityName: string, relationships: $relationships) {
    if (relationships instanceof Error) {
      return createAction(actionNames.indexRelationship(entityName))(relationships)
    }
    return createAction(actionNames.indexRelationship(entityName))({relationships})
  },
  createRelationship(entityName: string, relationships: $relationships) {
    if (relationships instanceof Error) {
      return createAction(actionNames.createRelationship(entityName))(relationships)
    }
    return createAction(actionNames.createRelationship(entityName))({relationships})
  },
}

// @flow
import * as Immutable from 'immutable'
import relationshipReducer from './reducer'
import actions from './actions'
import {relationshipTypes} from 'erschema'
const {MANY, ONE} = relationshipTypes

const getId = ()=>Math.round((Math.random() * 1000000))
const {Record, Map, OrderedSet} = Immutable

describe('entityReducer', function () {
  const name = 'users'
  const relationships = [
    {
      name: 'people',
      relationshipName: 'friends',
      type: MANY
    },
    {
      name: 'people',
      relationshipName: 'friend',
      type: ONE
    },
  ]
  
  function getDefaultState (initialState = {}) {
    return new (Record({friend: new Map(), friends: new Map(initialState)}))()
  }
  it('returns default state', function () {
    const defaultState = getDefaultState()
    const usersReducer = relationshipReducer({name, relationships})
    expect(usersReducer(undefined, {type: 1}).toObject()).toEqual(defaultState.toObject())
  })
  it('returns default state with config', function () {
    const defaultState = new (Record({friend: new Map(), friends: new Map(), otherData: new Map()}))()
    const usersReducer = relationshipReducer({name, relationships, defaultStateConfig: {otherData: new Map()}})
    expect(usersReducer(undefined, {type: 1}).toObject()).toEqual(defaultState.toObject())
  })
  describe('actions', function () {
    const usersReducer = relationshipReducer({name, relationships})
    const friendId = getId()
    it('creates Single', function () {
      const id = getId()  
      expect(usersReducer(undefined, actions.link(name, {relationshipName: 'friend', id, relationshipValue: friendId})).friend).toEqual(new Map({[id]: friendId}))
    })
    it('creates Multi', function () {
      const id = getId()  
      expect(usersReducer(undefined, actions.link(name, {relationshipName: 'friends', id, relationshipValue: friendId})).friends).toEqual(new Map({[id]: OrderedSet([friendId])}))
    })
  })
})

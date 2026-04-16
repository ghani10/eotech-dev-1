import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'public.events.index': { paramsTuple?: []; params?: {} }
    'public.events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.events.index': { paramsTuple?: []; params?: {} }
    'api.events.stats': { paramsTuple?: []; params?: {} }
    'events.store': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.events': { paramsTuple?: []; params?: {} }
    'admin.events.create': { paramsTuple?: []; params?: {} }
    'admin.events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota.create': { paramsTuple?: []; params?: {} }
    'admin.partners': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'public.events.index': { paramsTuple?: []; params?: {} }
    'public.events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.events.index': { paramsTuple?: []; params?: {} }
    'api.events.stats': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.events': { paramsTuple?: []; params?: {} }
    'admin.events.create': { paramsTuple?: []; params?: {} }
    'admin.events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota.create': { paramsTuple?: []; params?: {} }
    'admin.partners': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'public.events.index': { paramsTuple?: []; params?: {} }
    'public.events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'api.events.index': { paramsTuple?: []; params?: {} }
    'api.events.stats': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.events': { paramsTuple?: []; params?: {} }
    'admin.events.create': { paramsTuple?: []; params?: {} }
    'admin.events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota': { paramsTuple?: []; params?: {} }
    'admin.tickets.quota.create': { paramsTuple?: []; params?: {} }
    'admin.partners': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'events.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'events.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'events.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
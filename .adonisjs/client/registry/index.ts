/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'public.events.index': {
    methods: ["GET","HEAD"],
    pattern: '/events',
    tokens: [{"old":"/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['public.events.index']['types'],
  },
  'public.events.show': {
    methods: ["GET","HEAD"],
    pattern: '/events/:slug',
    tokens: [{"old":"/events/:slug","type":0,"val":"events","end":""},{"old":"/events/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['public.events.show']['types'],
  },
  'api.events.index': {
    methods: ["GET","HEAD"],
    pattern: '//api/v1/events',
    tokens: [{"old":"//api/v1/events","type":0,"val":"","end":""},{"old":"//api/v1/events","type":0,"val":"api","end":""},{"old":"//api/v1/events","type":0,"val":"v1","end":""},{"old":"//api/v1/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['api.events.index']['types'],
  },
  'api.events.stats': {
    methods: ["GET","HEAD"],
    pattern: '//api/v1/events/stats',
    tokens: [{"old":"//api/v1/events/stats","type":0,"val":"","end":""},{"old":"//api/v1/events/stats","type":0,"val":"api","end":""},{"old":"//api/v1/events/stats","type":0,"val":"v1","end":""},{"old":"//api/v1/events/stats","type":0,"val":"events","end":""},{"old":"//api/v1/events/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['api.events.stats']['types'],
  },
  'events.store': {
    methods: ["POST"],
    pattern: '/api/v1/events',
    tokens: [{"old":"/api/v1/events","type":0,"val":"api","end":""},{"old":"/api/v1/events","type":0,"val":"v1","end":""},{"old":"/api/v1/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['events.store']['types'],
  },
  'events.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/events/:id',
    tokens: [{"old":"/api/v1/events/:id","type":0,"val":"api","end":""},{"old":"/api/v1/events/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/events/:id","type":0,"val":"events","end":""},{"old":"/api/v1/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.show']['types'],
  },
  'events.update': {
    methods: ["PUT"],
    pattern: '/api/v1/events/:id',
    tokens: [{"old":"/api/v1/events/:id","type":0,"val":"api","end":""},{"old":"/api/v1/events/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/events/:id","type":0,"val":"events","end":""},{"old":"/api/v1/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.update']['types'],
  },
  'events.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/events/:id',
    tokens: [{"old":"/api/v1/events/:id","type":0,"val":"api","end":""},{"old":"/api/v1/events/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/events/:id","type":0,"val":"events","end":""},{"old":"/api/v1/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.destroy']['types'],
  },
  'admin.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/admin/dashboard',
    tokens: [{"old":"/admin/dashboard","type":0,"val":"admin","end":""},{"old":"/admin/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['admin.dashboard']['types'],
  },
  'admin.events': {
    methods: ["GET","HEAD"],
    pattern: '/admin/events',
    tokens: [{"old":"/admin/events","type":0,"val":"admin","end":""},{"old":"/admin/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['admin.events']['types'],
  },
  'admin.events.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/events/create',
    tokens: [{"old":"/admin/events/create","type":0,"val":"admin","end":""},{"old":"/admin/events/create","type":0,"val":"events","end":""},{"old":"/admin/events/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.events.create']['types'],
  },
  'admin.events.edit': {
    methods: ["GET","HEAD"],
    pattern: '/admin/events/:id/edit',
    tokens: [{"old":"/admin/events/:id/edit","type":0,"val":"admin","end":""},{"old":"/admin/events/:id/edit","type":0,"val":"events","end":""},{"old":"/admin/events/:id/edit","type":1,"val":"id","end":""},{"old":"/admin/events/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['admin.events.edit']['types'],
  },
  'admin.reports': {
    methods: ["GET","HEAD"],
    pattern: '/admin/reports',
    tokens: [{"old":"/admin/reports","type":0,"val":"admin","end":""},{"old":"/admin/reports","type":0,"val":"reports","end":""}],
    types: placeholder as Registry['admin.reports']['types'],
  },
  'admin.tickets.quota': {
    methods: ["GET","HEAD"],
    pattern: '/admin/tickets/quota',
    tokens: [{"old":"/admin/tickets/quota","type":0,"val":"admin","end":""},{"old":"/admin/tickets/quota","type":0,"val":"tickets","end":""},{"old":"/admin/tickets/quota","type":0,"val":"quota","end":""}],
    types: placeholder as Registry['admin.tickets.quota']['types'],
  },
  'admin.tickets.quota.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/tickets/quota/create',
    tokens: [{"old":"/admin/tickets/quota/create","type":0,"val":"admin","end":""},{"old":"/admin/tickets/quota/create","type":0,"val":"tickets","end":""},{"old":"/admin/tickets/quota/create","type":0,"val":"quota","end":""},{"old":"/admin/tickets/quota/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.tickets.quota.create']['types'],
  },
  'admin.partners': {
    methods: ["GET","HEAD"],
    pattern: '/admin/partners',
    tokens: [{"old":"/admin/partners","type":0,"val":"admin","end":""},{"old":"/admin/partners","type":0,"val":"partners","end":""}],
    types: placeholder as Registry['admin.partners']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

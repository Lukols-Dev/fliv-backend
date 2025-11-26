import configuration from './configuration';

const { app } = configuration();

export const API_PREFIX = app.apiPrefix;
export const API_VERSION_V1 = app.apiVersion;

const usersRoot = 'users';
const rolesRoot = 'roles';
const transportOrdersRoot = 'transport-orders';
const notificationsRoot = 'notifications';
const authRoot = 'auth';

const driverRoot = 'driver';
const dispatcherRoot = 'dispatcher';

export const routesV1 = {
  version: API_VERSION_V1,

  auth: {
    root: authRoot,
    login: 'login',
    logout: 'logout',
  },

  users: {
    root: usersRoot,
    byId: ':id',
  },

  roles: {
    root: rolesRoot,
  },

  transportOrders: {
    root: transportOrdersRoot,
    driver: {
      root: `${driverRoot}/${transportOrdersRoot}`,
      byId: ':id',
    },
    dispatcher: {
      root: `${dispatcherRoot}/${transportOrdersRoot}`,
      byId: ':id',
    },
  },

  notifications: {
    root: notificationsRoot,
  },
} as const;

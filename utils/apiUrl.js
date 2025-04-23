import { HOST } from '../config';

export const ACCOUNT = {
  login: `${HOST}auth/login`,
  logout: `${HOST}auth/logout`,
  forgot: `${HOST}auth/forgot`,
  verify: `${HOST}auth/verify`,
  reset: `${HOST}auth/reset`
};

export const USER = {
  createOne: `${HOST}users/create`,
  updateOne: `${HOST}users/update`,
  changePassword: `${HOST}users`,
  fetch: `${HOST}users/`,
  removeOne: `${HOST}users/delete`,
  getById: `${HOST}users/`,
  aggregate: `${HOST}users?action=aggregate`,
  search: `${HOST}users/`
};

export const CATEGORY = {
  createOne: `${HOST}categories`,
  updateOne: `${HOST}categories`,
  removeOne: `${HOST}categories`,
  fetch: `${HOST}categories`
};

export const INVOICE = {
  createOne: `${HOST}invoice`,
  updateOne: `${HOST}invoice`,
  removeOne: `${HOST}invoice/`,
  fetchMyInvoices: `${HOST}invoice?action=myInvoices`,
  fetchInvoices: `${HOST}invoice`,
  aggregate: `${HOST}invoice?action=aggregate`,
  searchInvoices: `${HOST}invoice?action=searchInvoices`
};

export const TASK_COMMENTS = {
  addOne: `${HOST}task_comment`,
  fetch: `${HOST}task_comment/`,
  removeOne: `${HOST}task_comment/`
};

export const CHURCH = {
  fetch: `${HOST}admin`,
  fetchOne: `${HOST}church`,
  uploadOne: `${HOST}church/update/`
};

export const SUBSCRIBER = {
  createIntegrator: `${HOST}subscriber`
};

export const DASHBOARD = {
  paginate: `${HOST}admin?action=paginate`,
  aggregate: `${HOST}admin?action=aggregate`,
  recent: `${HOST}admin?action=recent`,
  chart: `${HOST}admin?action=chart`
};

export const CHURCH_DASHBOARD = {
  paginate: `${HOST}church?action=paginate`,
  aggregate: `${HOST}church?action=aggregate`,
  recent: `${HOST}member?action=recent`,
  memberCount: `${HOST}member?action=count`,
  chart: `${HOST}member?action=chart`,
  trent: `${HOST}attendance?action=trent`
};

export const STRIPE = {
  createCustomer: `${HOST}stripe/customer`,
  createSubscriber: `${HOST}stripe/subscriber`,
  createCustomerPortalSession: `${HOST}stripe/customerPortal`
};

export const PROJECT = {
  createOne: `${HOST}project`,
  updateOne: `${HOST}project`,
  fetchOne: `${HOST}project/`,
  fetch: `${HOST}project/`,
  removeOne: `${HOST}project/`,
  paginate: `${HOST}project?action=paginate`,
  aggregate: `${HOST}project?action=aggregate`,
  recent: `${HOST}project?action=recent`,
  chart: `${HOST}project?action=chart`
};

export const DOCUMENT = {
  uploadOne: `${HOST}project_document`,
  fetch: `${HOST}project_document/`,
  removeOne: `${HOST}project_document/`
};

export const TASK_DOCUMENT = {
  uploadOne: `${HOST}task_document`,
  fetch: `${HOST}task_document/`,
  removeOne: `${HOST}task_document/`
};

export const TASK_TEAM = {
  addOne: `${HOST}task_team`,
  fetch: `${HOST}task_team/`,
  removeOne: `${HOST}task_team/`
};

export const TEAM = {
  addOne: `${HOST}project_team`,
  fetch: `${HOST}project_team/`,
  removeOne: `${HOST}project_team/`
};

export const REGULAR_SERVICE = {
  createOne: `${HOST}regularService`,
  updateOne: `${HOST}regularService`,
  fetchOne: `${HOST}regularService/`,
  fetch: `${HOST}regularService/`,
  removeOne: `${HOST}regularService/`
};

export const REGULAR_SERVICE_AGENDA = {
  createOne: `${HOST}regularService/agenda`,
  updateOne: `${HOST}regularService/agenda`,
  fetchOne: `${HOST}regularService/agenda`,
  fetch: `${HOST}regularService/agenda/`,
  removeOne: `${HOST}regularService/agenda/`
};

export const EVENT = {
  createOne: `${HOST}event`,
  updateOne: `${HOST}event`,
  fetch: `${HOST}event/`,
  removeOne: `${HOST}event/`,
  fetchTop10: `${HOST}event?action=top10`,
  paginate: `${HOST}event?action=paginate`,
  fetchOne: `${HOST}event`
};

export const EVENT_AGENDA = {
  createOne: `${HOST}event/agenda`,
  updateOne: `${HOST}event/agenda`,
  fetchOne: `${HOST}event/agenda`,
  fetch: `${HOST}event/agenda`,
  removeOne: `${HOST}event/agenda/`
};

export const FELLOWSHIP = {
  createOne: `${HOST}fellowship/create`,
  updateOne: `${HOST}fellowship/update`,
  fetch: `${HOST}fellowship/`,
  removeOne: `${HOST}fellowship/delete`
};

export const MEMBER = {
  createOne: `${HOST}member/create`,
  updateOne: `${HOST}member/update`,
  fetch: `${HOST}member/`,
  removeOne: `${HOST}member/delete`
};

export const DONATION = {
  createOne: `${HOST}donation/create`,
  updateOne: `${HOST}donation/update`,
  fetch: `${HOST}donation/`,
  removeOne: `${HOST}donation/delete`
};

export const TESTIMONY = {
  createOne: `${HOST}testimony/create`,
  updateOne: `${HOST}testimony/update`,
  fetch: `${HOST}testimony/`,
  removeOne: `${HOST}testimony/delete`
};

export const EVENT_REGISTER = {
  createOne: `${HOST}event/register`,
  updateOne: `${HOST}event/register`,
  fetch: `${HOST}event/register`,
  removeOne: `${HOST}event/register/`
};

export const CONTACT = {
  createOne: `${HOST}contact/create`,
  updateOne: `${HOST}contact/update`,
  fetch: `${HOST}contact/`,
  removeOne: `${HOST}contact/delete`
};

export const SLIDER = {
  createOne: `${HOST}slider/create`,
  updateOne: `${HOST}slider/update`,
  fetch: `${HOST}slider/`,
  removeOne: `${HOST}slider/delete`
};

export const PUSH_NOTIFICATION = {
  createOne: `${HOST}push_notification/create`,
  updateOne: `${HOST}push_notification/update`,
  fetch: `${HOST}push_notification`,
  removeOne: `${HOST}push_notification/delete`
};
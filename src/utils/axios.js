import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'accessToken';

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,

  async (error) => {
    if (error.response) {
      if (error.response && error.response.status === 401) {
        // Если получен статус 401 (Unauthorized), попытайтесь обновить токен и повторите запрос
        // alert('Token vaqti tugadi');
        // const refreshToken = sessionStorage.getItem(STORAGE_KEY);
        // const newAccessToken = await tokenRefresh(refreshToken);
        // console.log('dawdawdaw', refreshToken, newAccessToken);
        // // Обновите текущий токен в sessionStorage
        // sessionStorage.setItem(STORAGE_KEY, newAccessToken);
        // // Повторите запрос с новым токеном
        // return axios(error.config);
      }

      // Ошибка при получении ответа с сервера
      const { status } = error.response;

      if (status === 400) {
        enqueueSnackbar(error.response.data?.message, { variant: 'error' });
      } else if (status === 404) {
        enqueueSnackbar(error.response.data?.message, { variant: 'error' });
      } else {
        enqueueSnackbar(error.response.data?.message, { variant: 'error' });
      }
    } else if (error.request) {
      // Ошибка при отправке запроса
      enqueueSnackbar(error.request, { variant: 'error' });
    } else {
      // Другие ошибки
      enqueueSnackbar(error.message, { variant: 'error' });
    }

    return Promise.reject((error.response && error.response.data) || 'Что-то пошло не так');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  let res;

  if (config?.method === 'post') {
    res = await axiosInstance.post(url, config?.data, { ...config?.headers });
  } else {
    res = await axiosInstance.get(url, { ...config });
  }

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/validate_token.php',
    login: '/api/login.php',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  region: {
    list: '/api/v1/regionlist',
  },
  currency: {
    info: '/api/v1/dollar/rate',
    create: '/api/v1/dollarrate/create',
  },
  material: {
    list: '/api/v1/materiallist',
    measurelist: '/api/v1/measureunitlist',
    create: '/api/v1/material/create',
    update: '/api/v1/material/update',
    delete: '/api/v1/material/delete',
    search: '/api/v1/material/search',
  },
  client: {
    list: '/api/v1/clientslist',
    details: '/api/v1/client',
    delete: '/api/v1/client/delete',
    createPersonal: '/api/v1/personalclient/create',
    createBusiness: '/api/v1/businessclient/create',
    updatePersonal: '/api/v1/presonalclient/update',
    updateBusiness: '/api/v1/businessclient/update',
    search: '/api/v1/client/search',
    uploadPassport: '/api/v1/clients/passport',
    regionlist: '/api/v1/regionlist',
    uploadDocument: 'api/v1/clients/passport',
  },
  users: {
    list: '/api/v1/userlist',
    delete: '/api/v1/user/delete',
    create: '/api/create_user.php',
    update: '/api/update_user.php',
  },
  realtors: {
    list: '/api/v1/realtorlist',
    delete: '/api/v1/realtor/delete',
    create: '/api/v1/realtor/create',
    search: '/api/v1/realtor/search',
    contractList: '/api/v1/realtor/contractlist',
    contractSearch: '/api/v1/realtor/contract/search',
    contractAdd: '/api/v1/realtor/addcontract',
    contractUpdate: '/api/v1/realtor/updatecontract',
    contractDelete: '/api/v1/realtor/contract/delete',
    exportToExel: '/api/v1/realtor/contract/excel',
  },
  contragents: {
    list: '/api/v1/counterpartylist',
    create: '/api/v1/counterparty/create',
    update: '/api/v1/counterparty/update',
    categoryList: '/api/v1/counterpartycategorylist',
    categoryCreate: '/api/v1/counterpartycategory/create',
    categoryUpdate: '/api/v1/counterpartycategory/update',
    categorySearch: '/api/v1/counterpartycategory/search',
    search: '/api/v1/counterpartyclient/search',
  },
  object: {
    list: '/api/v1/projectlist',
    create: '/api/v1/project/create',
    update: 'api/v1/project/update',
    treelist: 'api/v1/allprojectinfo',
  },
  block: {
    list: '/api/v1/blocklist',
    create: '/api/v1/block/create',
    update: 'api/v1/block/update',
    delete: 'api/v1/block/delete',
    visual: 'api/v1/block/visual',
  },
  entrance: {
    list: '/api/v1/entrancelist',
    create: '/api/v1/entrance/create',
    update: 'api/v1/entrance/update',
    delete: 'api/v1/entrance/delete',
  },
  floor: {
    list: '/api/v1/floorlist',
    create: '/api/v1/floor/create',
    update: 'api/v1/floor/layoutupdate',
    delete: 'api/v1/floor/delete',
  },
  apartment: {
    list: '/api/v1/apartmentlist',
    create: '/api/v1/apartment/create',
    update: 'api/v1/apartment/update',
    delete: 'api/v1/apartment/delete',
    info: 'api/v1/apartment/info',
    apartmentoptions: 'api/v1/apartmentoption/list',
    apartmentoptionAdd: 'api/v1/apartmentoption/add',
    apartmentoptionDelete: 'api/v1/apartmentoption/delete',
    apartmentImages: 'api/v1/apartment/images',
    apartmentImageUpload: 'api/v1/apartmentimage/upload',
    apartmentImageRemove: 'api/v1/apartmentimage/delete',
  },
  layout: {
    list: '/api/v1/layoutall',
    listByType: '/api/v1/layoutlist',
    create: '/api/v1/layout/create',
    udapte: '/api/v1/layout/update',
    delete: '/api/v1/layout/delete',
    upload: 'api/v1/upload/layout',
    search: 'api/v1/layout/search',
  },
  contract: {
    list: '/api/v1/contractlist',
    overduedays: '/api/v1/contract/overduedays',
    search: '/api/v1/contract/search',
    searchClient: '/api/v1/contract/client/search',
    detail: '/api/v1/contract/info',
    createWithPlan: '/api/v1/contractplan/create',
    create: '/api/v1/contract/create',
    generatedates: 'api/v1/generatedates',
    generatedateshand: 'api/v1/manualfilling',
    update: 'api/v1/contract/update',
    updateWithPlan: 'api/v1/contractplan/update',
    delete: 'api/v1/contract/delete',
    uploadFile: 'api/v1/contract/file',
    confirm: 'api/v1/contract/finish',
  },

  warehouse: {
    arrivalList: '/api/v1/arrivallist',
    arrivalDetails: '/api/v1/arrival/read',
    arrivalDelete: '/api/v1/arrival/delete',
    arrivalCreate: '/api/v1/arrival/create',
    expenditureList: '/api/v1/expenditurelist',
    expenditureDelete: '/api/v1/expenditure/delete',
    expenditureCreate: '/api/v1/expenditure/create',
    list: '/api/v1/warehouselist',
    search: '/api/v1/warehouse/search',
    invoiceSearch: '/api/v1/invoicenumber/search',
  },

  payment: {
    list: '/api/v1/contract/payments',
    info: 'api/v1/contract/info',
    pay: '/api/v1/contract/pay',
    pay2: '/api/v1/kassa/create',
    delete: '/api/v1/kassa/delete',
    payKassaSklad: '/api/v1/kassasklad/pay',
    payKassaSkladList: '/api/v1/kassasklad/list',
    deleteKassaSklad: '/api/v1/kassasklad/delete',
    kassaBankExpenditureList: '/api/v1/kassabank/list',
    kassaBankPayExpenditure: '/api/v1/kassabank/pay',
    kassaBankSetRateExpenditure: '/api/v1/bankdollar/create',
    kassaBankDeleteExpenditure: '/api/v1/kassabank/delete',
    kassaBankArrivalList: '/api/v1/bankarrival/list',
    kassaBankPayArrival: '/api/v1/kassabank/arrival',
    kassaBankDeleteArrival: '/api/v1/bankarrival/delete',
    kassaBankCategories: '/api/v1/bankcategory/list',
    kassaBankCategoriesCreate: '/api/v1/bankcategory/create',
    kassaBankCategoriesUpdate: '/api/v1/bankcategory/update',
    kassaBankSearch: '/api/v1/bankcategory/search',
  },
  bartercontract: {
    list: '/api/v1/bartercontract/payments',
    info: 'api/v1/bartercontract/info',
    pay: '/api/v1/bartercontract/pay',
    pay2: '/api/v1/kassa/create',
    delete: '/api/v1/kassa/delete',
    payKassaSklad: '/api/v1/kassasklad/pay',
    payKassaSkladList: '/api/v1/kassasklad/list',
    deleteKassaSklad: '/api/v1/kassasklad/delete',
    kassaBankExpenditureList: '/api/v1/kassabank/list',
    kassaBankPayExpenditure: '/api/v1/kassabank/pay',
    kassaBankSetRateExpenditure: '/api/v1/bankdollar/create',
    kassaBankDeleteExpenditure: '/api/v1/kassabank/delete',
    kassaBankArrivalList: '/api/v1/bankarrival/list',
    kassaBankPayArrival: '/api/v1/kassabank/arrival',
    kassaBankDeleteArrival: '/api/v1/bankarrival/delete',
    kassaBankCategories: '/api/v1/bankcategory/list',
    kassaBankCategoriesCreate: '/api/v1/bankcategory/create',
    kassaBankCategoriesUpdate: '/api/v1/bankcategory/update',
    kassaBankSearch: '/api/v1/bankcategory/search',
  },
  bank: {
    list: '/api/v1/bank/payments',
  },
  checkerboard: {
    list: '/api/v1/shaxmatka',
    reserve: '/api/v1/apartment/temporaryreservation',
    dereserve: '/api/v1/apartment/temporaryreservation/delete',
  },
  visual: {
    project: '/api/v1/project/visual',
    block: '/api/v1/block/visual',
  },
};

// const tokenRefresh = async (refreshToken) => {
//   try {
//     const response = await axiosInstance.post(endpoints.auth.me);

//     // Вернуть новый токен
//     return response.data.jwt;
//   } catch (error) {
//     console.error('Error refreshing access token:', error.message);
//     throw error;
//   }
// };

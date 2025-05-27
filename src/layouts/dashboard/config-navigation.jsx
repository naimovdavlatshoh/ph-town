import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  contract: icon('ic_contract'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  cash: icon('ic_cash'),
  expense: icon('ic_expense'),
  investment: icon('ic_investment'),
  bank: icon('ic_bank'),
  warehouse: icon('ic_warehouse'),
  users: icon('ic_users'),
  helmet: icon('ic_helmet'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  statistic: icon('ic_analytics'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();
  // const data = useMemo(
  //   () => [
  //     // OVERVIEW
  //     // ----------------------------------------------------------------------
  //     {
  //       subheader: t('overview'),
  //       items: [
  //         {
  //           title: t('app'),
  //           path: paths.dashboard.root,
  //           icon: ICONS.dashboard,
  //         },
  //         {
  //           title: t('product'),
  //           path: paths.dashboard.product2,
  //           icon: ICONS.product,
  //         },
  //         {
  //           title: t('clients'),
  //           path: paths.dashboard.clients.root,
  //           icon: ICONS.user,
  //         },
  //         {
  //           title: t('My Objects'),
  //           path: paths.dashboard.object.root,
  //           icon: ICONS.user,
  //         },
  //         {
  //           title: t('ecommerce'),
  //           path: paths.dashboard.general.ecommerce,
  //           icon: ICONS.ecommerce,
  //         },
  //         {
  //           title: t('analytics'),
  //           path: paths.dashboard.general.analytics,
  //           icon: ICONS.analytics,
  //         },
  //         {
  //           title: t('banking'),
  //           path: paths.dashboard.general.banking,
  //           icon: ICONS.banking,
  //         },
  //         {
  //           title: t('booking'),
  //           path: paths.dashboard.general.booking,
  //           icon: ICONS.booking,
  //         },
  //         {
  //           title: t('file'),
  //           path: paths.dashboard.general.file,
  //           icon: ICONS.file,
  //         },
  //       ],
  //     },

  //     // MANAGEMENT
  //     // ----------------------------------------------------------------------
  //     {
  //       subheader: t('management'),
  //       items: [
  //         // USER
  //         {
  //           title: t('user'),
  //           path: paths.dashboard.user.root,
  //           icon: ICONS.user,
  //           children: [
  //             { title: t('profile'), path: paths.dashboard.user.root },
  //             { title: t('cards'), path: paths.dashboard.user.cards },
  //             { title: t('list'), path: paths.dashboard.user.list },
  //             { title: t('create'), path: paths.dashboard.user.new },
  //             { title: t('edit'), path: paths.dashboard.user.demo.edit },
  //             { title: t('account'), path: paths.dashboard.user.account },
  //           ],
  //         },

  //         // PRODUCT
  //         {
  //           title: t('product'),
  //           path: paths.dashboard.product.root,
  //           icon: ICONS.product,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.product.root },
  //             {
  //               title: t('details'),
  //               path: paths.dashboard.product.demo.details,
  //             },
  //             { title: t('create'), path: paths.dashboard.product.new },
  //             { title: t('edit'), path: paths.dashboard.product.demo.edit },
  //           ],
  //         },

  //         // ORDER
  //         {
  //           title: t('order'),
  //           path: paths.dashboard.order.root,
  //           icon: ICONS.order,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.order.root },
  //             { title: t('details'), path: paths.dashboard.order.demo.details },
  //           ],
  //         },

  //         // INVOICE
  //         {
  //           title: t('invoice'),
  //           path: paths.dashboard.invoice.root,
  //           icon: ICONS.invoice,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.invoice.root },
  //             {
  //               title: t('details'),
  //               path: paths.dashboard.invoice.demo.details,
  //             },
  //             { title: t('create'), path: paths.dashboard.invoice.new },
  //             { title: t('edit'), path: paths.dashboard.invoice.demo.edit },
  //           ],
  //         },

  //         // BLOG
  //         {
  //           title: t('blog'),
  //           path: paths.dashboard.post.root,
  //           icon: ICONS.blog,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.post.root },
  //             { title: t('details'), path: paths.dashboard.post.demo.details },
  //             { title: t('create'), path: paths.dashboard.post.new },
  //             { title: t('edit'), path: paths.dashboard.post.demo.edit },
  //           ],
  //         },

  //         // JOB
  //         {
  //           title: t('job'),
  //           path: paths.dashboard.job.root,
  //           icon: ICONS.job,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.job.root },
  //             { title: t('details'), path: paths.dashboard.job.demo.details },
  //             { title: t('create'), path: paths.dashboard.job.new },
  //             { title: t('edit'), path: paths.dashboard.job.demo.edit },
  //           ],
  //         },

  //         // TOUR
  //         {
  //           title: t('tour'),
  //           path: paths.dashboard.tour.root,
  //           icon: ICONS.tour,
  //           children: [
  //             { title: t('list'), path: paths.dashboard.tour.root },
  //             { title: t('details'), path: paths.dashboard.tour.demo.details },
  //             { title: t('create'), path: paths.dashboard.tour.new },
  //             { title: t('edit'), path: paths.dashboard.tour.demo.edit },
  //           ],
  //         },

  //         // FILE MANAGER
  //         {
  //           title: t('file_manager'),
  //           path: paths.dashboard.fileManager,
  //           icon: ICONS.folder,
  //         },

  //         // MAIL
  //         {
  //           title: t('mail'),
  //           path: paths.dashboard.mail,
  //           icon: ICONS.mail,
  //           info: <Label color="error">+32</Label>,
  //         },

  //         // CHAT
  //         {
  //           title: t('chat'),
  //           path: paths.dashboard.chat,
  //           icon: ICONS.chat,
  //         },

  //         // CALENDAR
  //         {
  //           title: t('calendar'),
  //           path: paths.dashboard.calendar,
  //           icon: ICONS.calendar,
  //         },

  //         // KANBAN
  //         {
  //           title: t('kanban'),
  //           path: paths.dashboard.kanban,
  //           icon: ICONS.kanban,
  //         },
  //       ],
  //     },

  //     // DEMO MENU STATES
  //     {
  //       subheader: t(t('other_cases')),
  //       items: [
  //         {
  //           // default roles : All roles can see this entry.
  //           // roles: ['user'] Only users can see this item.
  //           // roles: ['admin'] Only admin can see this item.
  //           // roles: ['admin', 'manager'] Only admin/manager can see this item.
  //           // Reference from 'src/guards/RoleBasedGuard'.
  //           title: t('item_by_roles'),
  //           path: paths.dashboard.permission,
  //           icon: ICONS.lock,
  //           roles: ['admin', 'manager'],
  //           caption: t('only_admin_can_see_this_item'),
  //         },
  //         {
  //           title: t('menu_level'),
  //           path: '#/dashboard/menu_level',
  //           icon: ICONS.menuItem,
  //           children: [
  //             {
  //               title: t('menu_level_1a'),
  //               path: '#/dashboard/menu_level/menu_level_1a',
  //             },
  //             {
  //               title: t('menu_level_1b'),
  //               path: '#/dashboard/menu_level/menu_level_1b',
  //               children: [
  //                 {
  //                   title: t('menu_level_2a'),
  //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2a',
  //                 },
  //                 {
  //                   title: t('menu_level_2b'),
  //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b',
  //                   children: [
  //                     {
  //                       title: t('menu_level_3a'),
  //                       path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3a',
  //                     },
  //                     {
  //                       title: t('menu_level_3b'),
  //                       path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3b',
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         {
  //           title: t('item_disabled'),
  //           path: '#disabled',
  //           icon: ICONS.disabled,
  //           disabled: true,
  //         },
  //         {
  //           title: t('item_label'),
  //           path: '#label',
  //           icon: ICONS.label,
  //           info: (
  //             <Label color="info" startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}>
  //               NEW
  //             </Label>
  //           ),
  //         },
  //         {
  //           title: t('item_caption'),
  //           path: '#caption',
  //           icon: ICONS.menuItem,
  //           caption:
  //             'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
  //         },
  //         {
  //           title: t('item_external_link'),
  //           path: 'https://www.google.com/',
  //           icon: ICONS.external,
  //         },
  //         {
  //           title: t('blank'),
  //           path: paths.dashboard.blank,
  //           icon: ICONS.blank,
  //         },
  //       ],
  //     },
  //   ],
  //   [t]
  // );

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('Dashboard'),
        items: [
          {
            title: t('Дашборд'),
            path: paths.dashboard.home.root,
            icon: ICONS.statistic,
            roles: ['1', '4', '6'],
          },
          {
            title: t('Материалы'),
            path: paths.dashboard.product2,
            icon: ICONS.product,
            roles: ['1', '4', '6'],
          },
          {
            title: t('Клиенты'),
            path: paths.dashboard.clients.root,
            icon: ICONS.user,
            roles: ['1', '2', '3', '5'],
          },
          {
            title: t('Мои объекты'),
            path: paths.dashboard.object.root,
            icon: ICONS.banking,
            roles: ['1', '2', '3'],
          },
          {
            title: t('Контракты'),
            path: paths.dashboard.contracts.root,
            icon: ICONS.contract,
            roles: ['1', '2', '3', '5'],
          },
          {
            title: t('Касса-Контракт'),
            path: paths.dashboard.payments.root,
            icon: ICONS.cash,
            roles: ['1', '2', '5'],
          },
          {
            title: t('Касса-Контракт-Бартер'),
            path: paths.dashboard.bartercontract.root,
            icon: ICONS.cash,
            roles: ['1', '2', '5'],
          },
          {
            title: t('Просроченные оплаты'),
            path: paths.dashboard.overduecontract.root,
            icon: ICONS.calendar,
            roles: ['1', '2', '5'],
          },
          {
            title: t('Касса-Банк'),
            path: paths.dashboard.bank.root,
            icon: ICONS.expense,
            roles: ['1', '7'],
          },
          {
            title: t('Касса-Склад'),
            path: paths.dashboard.payments.kassaSklad,
            icon: ICONS.investment,
            roles: ['1', '4', '5'],
          },
          // {
          //   title: t('Банк'),
          //   path: paths.dashboard.bank.root,
          //   icon: ICONS.banking,
          //   roles: ['1', '2'],
          // },
          {
            title: t('Склад'),
            path: paths.dashboard.warehouse.root,
            icon: ICONS.warehouse,
            roles: ['1', '4', '5', '6'],
          },
          {
            title: t('Пользователи'),
            path: paths.dashboard.users.root,
            icon: ICONS.users,
            roles: ['1'],
          },
          {
            title: t('Контрагенты'),
            path: paths.dashboard.contragents.root,
            icon: ICONS.helmet,
            roles: ['1', '4', '6'],
          },
          {
            title: t('Риэлторы'),
            path: paths.dashboard.realtors.root,
            icon: ICONS.expense,
            roles: ['1'],
          },
        ],
      },
    ],
    [t]
  );

  return data;
}

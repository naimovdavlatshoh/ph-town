import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// STATISTIC
const StatisticPage = lazy(() => import('src/pages/dashboard/statistic/list'));

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const ProductListPage2 = lazy(() => import('src/pages/dashboard/product2/list'));

const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));

// CLIENT

const ClientListPage = lazy(() => import('src/pages/dashboard/clients/list'));
const ClientCreatePage = lazy(() => import('src/pages/dashboard/clients/new'));
const ClientEditPage = lazy(() => import('src/pages/dashboard/clients/edit'));
const ClientDetailPage = lazy(() => import('src/pages/dashboard/clients/details'));

// USERS

const UsersListPage = lazy(() => import('src/pages/dashboard/users/list'));

// REALTORS

const RealtorListPage = lazy(() => import('src/pages/dashboard/realtor/list'));

// CONTRAGENTS

const ContragentListPage = lazy(() => import('src/pages/dashboard/contragents/list'));

// Object

const ObjectListPage = lazy(() => import('src/pages/dashboard/object/list'));
const ObjectDetailPage = lazy(() => import('src/pages/dashboard/object/details'));

// Object

const CheckerboardView = lazy(() => import('src/pages/dashboard/checkerboard/list'));

// Block

const BlockDetailPage = lazy(() => import('src/pages/dashboard/block/details'));

// Layout

const LayoutListPage = lazy(() => import('src/pages/dashboard/layout/list'));

// CONTRACT
const ContractListPage = lazy(() => import('src/pages/dashboard/contract/list'));
const ContractCreatePage = lazy(() => import('src/pages/dashboard/contract/new'));
const ContractEditPage = lazy(() => import('src/pages/dashboard/contract/edit'));
const ContractDetailsPage = lazy(() => import('src/pages/dashboard/contract/details'));

// BARTER CONTRACT
const BarterContractListPage = lazy(() => import('src/pages/dashboard/bartercontract/list'));
const BarterContractCreatePage = lazy(() => import('src/pages/dashboard/bartercontract/new'));

// OVERDUE CONTRACT
const OverdueContractListPage = lazy(() => import('src/pages/dashboard/overdue/list'));

// PAYMENTS
const PaymentsListPage = lazy(() => import('src/pages/dashboard/payments/list'));
const PaymentsCreatePage = lazy(() => import('src/pages/dashboard/payments/new'));
const PaymentsEditPage = lazy(() => import('src/pages/dashboard/payments/edit'));

const KassaSklad = lazy(() => import('src/pages/dashboard/kassa-sklad/list'));

// BANK
const BankPage = lazy(() => import('src/pages/dashboard/bank/list'));

// WAREHOUSE
const WarehouseListPage = lazy(() => import('src/pages/dashboard/warehouse/list'));
const ArrivalCreatePage = lazy(() => import('src/pages/dashboard/warehouse/new'));
const ArrivalEditPage = lazy(() => import('src/pages/dashboard/warehouse/edit'));
const ArrivalDetailsPage = lazy(() => import('src/pages/dashboard/warehouse/details'));

// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      // { element: <IndexPage />, index: true },
      {
        path: 'home',
        element: (
          <RoleBasedGuard hasContent roles={['1', '4', '6']}>
            <StatisticPage />
          </RoleBasedGuard>
        ),
      },
      {
        path: 'product2/:page?',
        element: (
          <RoleBasedGuard hasContent roles={['1', '4', '6']}>
            <ProductListPage2 />{' '}
          </RoleBasedGuard>
        ),
      },
      {
        path: 'clients/:page?',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ClientListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ClientCreatePage />{' '}
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ClientEditPage />{' '}
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ClientDetailPage />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: 'objects',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3']}>
                <ObjectListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: ':id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3']}>
                <ObjectDetailPage />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: 'checkerboards',
        children: [
          {
            path: ':id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3']}>
                <CheckerboardView />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: 'blocks',
        children: [
          {
            path: ':projectId/:blockId/',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3']}>
                <BlockDetailPage />
              </RoleBasedGuard>
            ),
          },
        ],
      },

      {
        path: 'contracts',
        children: [
          {
            path: ':page?',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ContractListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ContractCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: 'new/:id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ContractCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ContractEditPage />
              </RoleBasedGuard>
            ),
          },
          {
            path: 'details/:id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '4', '5']}>
                <ContractDetailsPage />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: 'overdue-contracts',
        children: [
          {
            path: ':page?',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <OverdueContractListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          // {
          //   path: 'new',
          //   element: (
          //     <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
          //       <ContractCreatePage />
          //     </RoleBasedGuard>
          //   ),
          // },
          // {
          //   path: 'new/:id',
          //   element: (
          //     <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
          //       <ContractCreatePage />
          //     </RoleBasedGuard>
          //   ),
          // },
          // {
          //   path: ':id/edit',
          //   element: (
          //     <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
          //       <ContractEditPage />
          //     </RoleBasedGuard>
          //   ),
          // },
          // {
          //   path: 'details/:id',
          //   element: (
          //     <RoleBasedGuard hasContent roles={['1', '2', '3', '4', '5']}>
          //       <ContractDetailsPage />
          //     </RoleBasedGuard>
          //   ),
          // },
        ],
      },

      // jjjjj
      {
        path: 'barter-contracts/:page?',
        children: [
          {
            path: ':page?',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <BarterContractListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <BarterContractCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: 'new/:id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '3', '5']}>
                <ContractCreatePage />
              </RoleBasedGuard>
            ),
          },
        ],
      },

      {
        path: 'payments/:page?',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '5']}>
                <PaymentsListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '5']}>
                <PaymentsCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleBasedGuard hasContent roles={['1', '2', '5']}>
                <PaymentsEditPage />
              </RoleBasedGuard>
            ),
          },
        ],
      },

      {
        path: 'kassa-sklad/:page?',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5']}>
                <KassaSklad />
              </RoleBasedGuard>
            ),
            index: true,
          },
        ],
      },

      {
        path: 'bank/:page?',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '7']}>
                <BankPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
        ],
      },

      {
        path: 'warehouse',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5', '6']}>
                <WarehouseListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5', '6']}>
                <ArrivalCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: 'new/:id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5', '6']}>
                <ArrivalCreatePage />
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5', '6']}>
                {' '}
                <ArrivalEditPage />{' '}
              </RoleBasedGuard>
            ),
          },
          {
            path: ':id',
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '5', '6']}>
                <ArrivalDetailsPage />{' '}
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1']}>
                <UsersListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
        ],
      },
      {
        path: 'realtors',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1']}>
                <RealtorListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
        ],
      },
      {
        path: 'contragents',
        children: [
          {
            element: (
              <RoleBasedGuard hasContent roles={['1', '4', '6']}>
                <ContragentListPage />
              </RoleBasedGuard>
            ),
            index: true,
          },
        ],
      },
      {
        path: 'layouts',
        children: [{ path: ':id', element: <LayoutListPage />, index: true }],
      },
      // {
      //   path: 'order',
      //   children: [
      //     { element: <OrderListPage />, index: true },
      //     { path: 'list', element: <OrderListPage /> },
      //     { path: ':id', element: <OrderDetailsPage /> },
      //   ],
      // },

      // { path: 'ecommerce', element: <OverviewEcommercePage /> },
      // { path: 'analytics', element: <OverviewAnalyticsPage /> },
      // { path: 'banking', element: <OverviewBankingPage /> },
      // { path: 'booking', element: <OverviewBookingPage /> },
      // { path: 'file', element: <OverviewFilePage /> },
      // {
      //   path: 'user',
      //   children: [
      //     { element: <UserProfilePage />, index: true },
      //     { path: 'profile', element: <UserProfilePage /> },
      //     { path: 'cards', element: <UserCardsPage /> },
      //     { path: 'list', element: <UserListPage /> },
      //     { path: 'new', element: <UserCreatePage /> },
      //     { path: ':id/edit', element: <UserEditPage /> },
      //     { path: 'account', element: <UserAccountPage /> },
      //   ],
      // },
      // {
      //   path: 'product',
      //   children: [
      //     { element: <ProductListPage />, index: true },
      //     { path: 'list', element: <ProductListPage /> },
      //     { path: ':id', element: <ProductDetailsPage /> },
      //     { path: 'new', element: <ProductCreatePage /> },
      //     { path: ':id/edit', element: <ProductEditPage /> },
      //   ],
      // },

      // {
      //   path: 'invoice',
      //   children: [
      //     { element: <InvoiceListPage />, index: true },
      //     { path: 'list', element: <InvoiceListPage /> },
      //     { path: ':id', element: <InvoiceDetailsPage /> },
      //     { path: ':id/edit', element: <InvoiceEditPage /> },
      //     { path: 'new', element: <InvoiceCreatePage /> },
      //   ],
      // },
      // {
      //   path: 'post',
      //   children: [
      //     { element: <BlogPostsPage />, index: true },
      //     { path: 'list', element: <BlogPostsPage /> },
      //     { path: ':title', element: <BlogPostPage /> },
      //     { path: ':title/edit', element: <BlogEditPostPage /> },
      //     { path: 'new', element: <BlogNewPostPage /> },
      //   ],
      // },
      // {
      //   path: 'job',
      //   children: [
      //     { element: <JobListPage />, index: true },
      //     { path: 'list', element: <JobListPage /> },
      //     { path: ':id', element: <JobDetailsPage /> },
      //     { path: 'new', element: <JobCreatePage /> },
      //     { path: ':id/edit', element: <JobEditPage /> },
      //   ],
      // },
      // {
      //   path: 'tour',
      //   children: [
      //     { element: <TourListPage />, index: true },
      //     { path: 'list', element: <TourListPage /> },
      //     { path: ':id', element: <TourDetailsPage /> },
      //     { path: 'new', element: <TourCreatePage /> },
      //     { path: ':id/edit', element: <TourEditPage /> },
      //   ],
      // },
      // { path: 'file-manager', element: <FileManagerPage /> },
      // { path: 'mail', element: <MailPage /> },
      // { path: 'chat', element: <ChatPage /> },
      // { path: 'calendar', element: <CalendarPage /> },
      // { path: 'kanban', element: <KanbanPage /> },
      // { path: 'permission', element: <PermissionDeniedPage /> },
      // { path: 'blank', element: <BlankPage /> },
    ],
  },
];

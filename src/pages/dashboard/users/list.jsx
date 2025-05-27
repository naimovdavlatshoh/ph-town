import { Helmet } from 'react-helmet-async';

import UsersListView from 'src/sections/users/users-list-view';

// ----------------------------------------------------------------------

export default function UsersListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список пользователей</title>
      </Helmet>

      <UsersListView />
    </>
  );
}

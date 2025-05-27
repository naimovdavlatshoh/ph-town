import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

import ObjectItem from './object-item';
import ObjectItemCreate from './object-item-create';

// ----------------------------------------------------------------------

export default function ObjectList({ objects, onCreate }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const handleView = useCallback(
    (id) => {
      router.push(paths.dashboard.job.details(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.job.edit(id));
    },
    [router]
  );

  const handleDelete = useCallback((id) => {
    console.info('DELETE', id);
  }, []);

  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(4, 1fr)',
      }}
    >
      {['1', '2'].includes(user?.role) && <ObjectItemCreate onCreate={onCreate} />}

      {objects.map((object) => (
        <ObjectItem
          key={object.id}
          object={object}
          onView={() => handleView(object.id)}
          onEdit={() => handleEdit(object.id)}
          onDelete={() => handleDelete(object.id)}
        />
      ))}
    </Box>
  );
}

ObjectList.propTypes = {
  objects: PropTypes.array,
  onCreate: PropTypes.func,
};

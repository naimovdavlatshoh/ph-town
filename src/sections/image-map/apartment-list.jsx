import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import TourItem from './apartment-item';

// ----------------------------------------------------------------------

export default function ApartmentList({ apartments }) {
  const router = useRouter();

  const handleView = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.details(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.tour.edit(id));
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
        md: 'repeat(3, 1fr)',
      }}
    >
      {apartments?.map((apartment, idx) => (
        <TourItem
          key={apartment.apartment_id}
          apartment={apartment}
          onView={() => handleView(apartment.apartment_id)}
          onEdit={() => handleEdit(apartment.apartment_id)}
          onDelete={() => handleDelete(apartment.apartment_id)}
        />
      ))}
    </Box>
  );
}

ApartmentList.propTypes = {
  apartments: PropTypes.array,
};

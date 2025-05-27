import { useCallback } from 'react';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _jobs } from 'src/_mock';

import BlockItem from './block-item';

// ----------------------------------------------------------------------

export default function BlockList() {
  const blocks = _jobs;

  const router = useRouter();

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
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
      >
        {blocks.map((block) => (
          <BlockItem
            key={block.id}
            job={block}
            onView={() => handleView(block.id)}
            onEdit={() => handleEdit(block.id)}
            onDelete={() => handleDelete(block.id)}
          />
        ))}
      </Box>

      {/* {blocks.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )} */}
    </>
  );
}

// BlockList.propTypes = {
//   blocks: PropTypes.array,
// };

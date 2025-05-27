import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Button, Divider, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { bgGradient } from 'src/theme/css';
import { useGetBlocks } from 'src/api/block';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import BlockNewEditForm from './block-new-edit-form';

// ----------------------------------------------------------------------

export default function BlockItem({ color = 'primary', sx, block }) {
  const { user } = useAuthContext();
  const { update, remove } = useGetBlocks(block?.project_id);

  const { enqueueSnackbar } = useSnackbar();

  const blockEdit = useBoolean();
  const confirmDelete = useBoolean();

  const theme = useTheme();

  const params = useParams();

  const onDelete = () => {
    remove(block?.block_id, () => {
      enqueueSnackbar('Блок успешно удален');
      confirmDelete.onFalse();
    });
  };

  return (
    <>
      <Stack
        alignItems="center"
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette[color].light, 0.2),
            endColor: alpha(theme.palette[color].main, 0.2),
          }),
          py: 2,
          borderRadius: 2,
          textAlign: 'center',
          color: `${color}.darker`,
          backgroundColor: 'common.white',
          ...sx,
        }}
      >
        {/* <Typography variant="h3">{fShortenNumber(total)}</Typography> */}

        <RouterLink
          color="inherit"
          href={paths.dashboard.block.details(block?.project_id, block?.block_id)}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
            {block?.block_name}
          </Typography>
        </RouterLink>

        <Typography variant="body2" sx={{ opacity: 0.64, pt: 2 }}>
          Квартир ({block?.apartments_count})
        </Typography>
        <Divider sx={{ borderStyle: 'dashed' }} />

        {['1', '2'].includes(user?.role) && (
          <Stack sx={{ pt: 3 }} textAlign="center" direction="row" justifyContent="space-between">
            <IconButton onClick={blockEdit.onTrue}>
              <Iconify width={20} icon="basil:edit-outline" color="orange" />
            </IconButton>
            <IconButton onClick={confirmDelete.onTrue}>
              {' '}
              <Iconify width={20} icon="majesticons:delete-bin-line" color="red" />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <BlockNewEditForm
        projectId={block?.project_id}
        currentBlock={block}
        open={blockEdit.value}
        onClose={blockEdit.onFalse}
        onUpdate={update}
      />
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены что хотите удалить блок?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </>
  );
}

BlockItem.propTypes = {
  color: PropTypes.string,
  sx: PropTypes.object,
  block: PropTypes.object,
};

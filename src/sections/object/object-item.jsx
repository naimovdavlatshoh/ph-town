import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Button, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { useGetObjects } from 'src/api/object';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';

import ObjectNewEditForm from './object-new-edit-form';
import CheckerboardFullscreenDialog from '../checkerboard/checkerboard-fullscreen-dialog';

// ----------------------------------------------------------------------

export default function ObjectItem({ object }) {
  const { user } = useAuthContext();
  const popover = usePopover();
  const { project_id, project_name, created_at, block_count, apartment_count } = object;

  const { update } = useGetObjects();

  const fullscreen = useBoolean();
  const editObject = useBoolean();

  const mdDown = useResponsive('down', 'md');

  return (
    <>
      <Card>
        {['1', '2'].includes(user?.role) && (
          <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        )}

        <Stack sx={{ p: 3, pb: 2 }} textAlign="center">
          <ListItemText
            sx={{ mb: 1 }}
            primary={
              <Link
                component={RouterLink}
                color="inherit"
                href={
                  ['1', '2'].includes(user?.role) ? paths.dashboard.object.details(project_id) : ''
                }
              >
                {project_name}
              </Link>
            }
            secondary={`Создан: ${fDate(created_at)}`}
            primaryTypographyProps={{
              typography: 'subtitle1',
            }}
            secondaryTypographyProps={{
              mt: 1,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />

          <Stack
            spacing={0.5}
            direction="row"
            alignItems="center"
            justifyContent="space-evenly"
            sx={{ color: 'primary.main', typography: 'caption' }}
          >
            <Stack flexDirection="row" alignItems="center">
              <Iconify width={16} icon="svg-spinners:blocks-scale" mr={0.5} />
              {block_count} Блоков
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <Iconify width={16} icon="material-symbols:apartment-rounded" />
              {apartment_count} Помещений
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack
          sx={{ p: 3 }}
          textAlign="center"
          direction={!mdDown ? 'row' : 'column'}
          justifyContent="center"
          gap={1}
        >
          {['1', '2'].includes(user?.role) && (
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              href={paths.dashboard.object.details(project_id)}
            >
              Наполнить
            </Button>
          )}

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Iconify width={20} icon="bxs:chess" />}
            onClick={fullscreen.onTrue}
          >
            Шахматка
          </Button>
        </Stack>
      </Card>
      <CheckerboardFullscreenDialog
        objectId={object.project_id}
        open={fullscreen.value}
        handleClose={fullscreen.onToggle}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem component={RouterLink} href={paths.dashboard.object.details(project_id)}>
          <Iconify icon="solar:eye-bold" />
          Посмотреть
        </MenuItem>

        {['1', '2'].includes(user?.role) && (
          <>
            <MenuItem
              onClick={() => {
                editObject.onTrue();
                popover.onClose();
                // onEdit();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Изменить
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                // onDelete();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              Удалить
            </MenuItem>
          </>
        )}
      </CustomPopover>

      <ObjectNewEditForm
        open={editObject.value}
        onClose={() => {
          editObject.onFalse();
        }}
        currentObject={{ name: object?.project_name, id: object?.project_id }}
        onUpdate={update}
      />
    </>
  );
}

ObjectItem.propTypes = {
  object: PropTypes.string,
};

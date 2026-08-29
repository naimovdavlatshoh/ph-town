import * as React from 'react';
import PropTypes from 'prop-types';

import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useGetObjects } from 'src/api/object';

import Iconify from 'src/components/iconify';

import ParkingBoardView from './parking-board-view';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function ParkingFullscreenDialog({ objectId, open, handleClose }) {
  const { objects } = useGetObjects();

  const currentObject = objects?.find((obj) => obj.project_id === objectId);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <Iconify icon="material-symbols:close" />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="overline" component="div">
            Парковка — {currentObject?.project_name}
          </Typography>

          <Button autoFocus color="inherit" onClick={handleClose}>
            Закрыть
          </Button>
        </Toolbar>
      </AppBar>
      {open && <ParkingBoardView objectId={objectId} />}
    </Dialog>
  );
}

ParkingFullscreenDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  objectId: PropTypes.string,
};

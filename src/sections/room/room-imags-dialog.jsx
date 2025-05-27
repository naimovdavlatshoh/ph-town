import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGetApartmentImages } from 'src/api/apartment';

import UploadImage from 'src/components/upload/uploadImage';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function RoomImagesDialog({
  roomId,
  title = 'Upload Files',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}) {
  const { images, upload, remove, imagesLoading } = useGetApartmentImages(roomId);

  const { enqueueSnackbar } = useSnackbar();

  const [files, setFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setUploadLoading(false);
      setRemoveLoading(false);
    }
  }, [open]);

  const handleDrop = useCallback(
    (newFile) => {
      setUploadLoading(true);
      handleUpload(newFile[0], () => {
        enqueueSnackbar('Изображение добавлено');
        setUploadLoading(false);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  const handleUpload = (file, cb) => {
    upload(roomId, file, cb);
  };

  const handleRemoveFile = (id) => {
    setRemoveLoading(true);
    remove(id, () => {
      enqueueSnackbar('Изображение удалено');
      setRemoveLoading(false);
    });
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none', position: 'relative' }}>
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Folder name"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}

        <UploadImage files={images} onDrop={handleDrop} onRemove={handleRemoveFile} />
        {imagesLoading && (
          <LoadingScreen
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 99999,
              background: '#fff',
            }}
            title="Загрузка изображений..."
          />
        )}

        {uploadLoading && (
          <LoadingScreen
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 99999,
              background: '#fff',
            }}
            title="Загружается изображение..."
          />
        )}

        {removeLoading && (
          <LoadingScreen
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 99999,
              background: '#fff',
            }}
            title="Удаляется изображение..."
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Закрыть
        </Button>

        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={onCreate || onUpdate}>
              {onUpdate ? 'Save' : 'Create'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}

RoomImagesDialog.propTypes = {
  roomId: PropTypes.string,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};

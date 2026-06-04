import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

// import { fFileSize } from 'src/utils/format-number';

import Image from '../image';
// import Iconify from '../iconify';

export default function SingleFilePreview({ file }) {
  // console.log('PREVIEW FILE:', file); // оставь временно

  const fileName = typeof file === 'string' ? file : file?.name || file?.preview || '';
  const fileType = (typeof file === 'object' && file?.type) || '';

  const isPdf = fileType.includes('pdf') || /\.pdf(\?|$)/i.test(fileName);
  const isImage =
    fileType.startsWith('image') || /\.(jpe?g|png|gif|bmp|webp)(\?|$)/i.test(fileName);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ p: 1, top: 0, left: 0, width: 1, height: 1, position: 'absolute' }}
    >
      {isImage ? (
        <Image
          alt="file preview"
          src={typeof file === 'string' ? file : file.preview}
          sx={{ width: 1, height: 1, borderRadius: 1 }}
        />
      ) : (
        <Stack alignItems="center" justifyContent="center" gap={1} sx={{ width: 1, height: 1 }}>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 64,
              height: 64,
              borderRadius: 1,
              bgcolor: 'error.lighter',
              color: 'error.dark',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {isPdf ? 'PDF' : 'FILE'}
          </Stack>
          <Typography variant="caption" sx={{ wordBreak: 'break-all', textAlign: 'center', px: 1 }}>
            {fileName.split('/').pop()}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

function getImageTypeByExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'unknown';
  }
  const extension = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  }
  if (['pdf'].includes(extension)) {
    return 'pdf';
  }
  return 'unknown';
}

SingleFilePreview.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

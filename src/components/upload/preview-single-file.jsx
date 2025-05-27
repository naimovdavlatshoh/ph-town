import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

import { fFileSize } from 'src/utils/format-number';

import Image from '../image';

// ----------------------------------------------------------------------

export default function SingleFilePreview({ file }) {
  const fileType =
    typeof file === 'string' ? getImageTypeByExtension(file) : getImageTypeByExtension(file.name);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    >
      {fileType === 'image' && (
        <Image
          alt="file preview"
          src={typeof file === 'string' ? file : file.preview}
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
          }}
        />
      )}
      {fileType === 'pdf' && (
        <>
          <Image
            alt="file preview"
            src="https://play-lh.googleusercontent.com/C33HqYgilwnqGsoPlEh_WzAlZIF2YrAkkdef_YEsILWbxGIG4UCzNTxF7iq9bzdxPw"
            sx={{
              width: 0.4,
              height: 0.4,
              borderRadius: 1,
            }}
          />
          {typeof file !== 'string' && (
            <Stack gap={1}>
              <Typography>
                <b>Название:</b> {file.name}
              </Typography>

              <Typography>
                <b>Размер:</b> {fFileSize(file.size)}
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}

function getImageTypeByExtension(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  }

  if (['pdf'].includes(extension)) {
    return 'pdf';
  }
  // Добавьте другие поддерживаемые расширения по мере необходимости
  return 'unknown';
}

SingleFilePreview.propTypes = {
  file: PropTypes.object,
};

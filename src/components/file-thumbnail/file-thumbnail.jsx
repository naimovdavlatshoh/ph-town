import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import DownloadButton from './download-button';
import { fileData, fileFormat } from './utils';

// ----------------------------------------------------------------------

export default function FileThumbnail({
  file,
  tooltip,
  imageView,
  onDownload,
  sx,
  imgSx,
  onClick,
}) {
  const { name = '', path = '', preview = '' } = fileData(file);

  const format = fileFormat(path || preview);

  const renderContent =
    format === 'image' && imageView ? (
      <Box
        onClick={onClick}
        component="img"
        src={preview}
        sx={{
          width: 1,
          height: 1,
          flexShrink: 0,
          objectFit: 'cover',
          ...imgSx,
        }}
      />
    ) : (
      <Box
        onClick={onClick}
        component="img"
        src={file?.webp_file_path}
        sx={{
          width: 50,
          height: 50,
          flexShrink: 0,
          ...sx,
        }}
      />
    );

  if (tooltip) {
    return (
      <Tooltip title={name}>
        <Stack
          flexShrink={0}
          component="span"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 'fit-content',
            height: 'inherit',
          }}
        >
          {renderContent}
          {onDownload && <DownloadButton onDownload={onDownload} />}
        </Stack>
      </Tooltip>
    );
  }

  return (
    <>
      {renderContent}
      {onDownload && <DownloadButton onDownload={onDownload} />}
    </>
  );
}

FileThumbnail.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  imageView: PropTypes.bool,
  imgSx: PropTypes.object,
  onDownload: PropTypes.func,
  onClick: PropTypes.func,
  sx: PropTypes.object,
  tooltip: PropTypes.bool,
};

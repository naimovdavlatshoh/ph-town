import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

export default function TooltipVisual({ type, title, icon, sx, ...other }) {
  return (
    <Card
      sx={{
        position: 'absolute',
        zIndex: 9999,
        left: other.left,
        top: other.top,
        display: other.display || 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        ...sx,
      }}
      {...other}
    >
      <Box textAlign="center">
        <Box sx={{ mb: 1, typography: 'h6', fontSize: '14px !important' }}>{title}</Box>
        <Box sx={{ color: 'text.secondary', typography: 'caption' }}>
          {(type === 'project' && 'Блок') || (type === 'block' && 'Этаж') || ''}
        </Box>
      </Box>
    </Card>
  );
}

TooltipVisual.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  type: PropTypes.string,
  total: PropTypes.number,
};

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import Iconify from '../iconify';
import LinkItem from './link-item';

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  status,
  backLink,

  sx,
  actionGap = 0,
  ...other
}) {
  const lastLink = links?.length ? links[links.length - 1].name : '';

  return (
    <Box sx={{ ...sx }}>
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          {/* HEADING */}
          {heading && (
            <Stack spacing={1} direction="row" alignItems="center">
              {backLink && (
                <IconButton component={RouterLink} href={backLink}>
                  <Iconify icon="eva:arrow-ios-back-fill" />
                </IconButton>
              )}

              <Stack spacing={0.5}>
                <Stack spacing={1} direction="row" alignItems="center">
                  <Typography variant="h4">{heading} </Typography>
                  {status && status()}
                </Stack>

                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  {/* {fDateTime(createdAt)} */}
                </Typography>
              </Stack>
            </Stack>
          )}

          {/* BREADCRUMBS */}
          {!!links?.length && (
            <Breadcrumbs separator={<Separator />} {...other}>
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>

        {action && (
          <Stack direction="row" alignItems="center" gap={actionGap} sx={{ flexShrink: 0 }} pr={6}>
            {' '}
            {action}{' '}
          </Stack>
        )}
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

CustomBreadcrumbs.propTypes = {
  sx: PropTypes.object,
  action: PropTypes.node,
  links: PropTypes.array,
  heading: PropTypes.string,
  moreLink: PropTypes.array,
  activeLast: PropTypes.bool,
  actionGap: PropTypes.number,
  status: PropTypes.func,
  backLink: PropTypes.string,
};

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'text.disabled',
      }}
    />
  );
}

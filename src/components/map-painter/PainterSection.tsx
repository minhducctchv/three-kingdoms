import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Radio,
} from '@material-ui/core';
import { Layers } from '@material-ui/icons';
import FactionAutocomplete from './FactionAutocomplete';
import { useStoreState, useStoreActions } from '../../store';

import campaigns from '../../data/common/campaigns.json';
import factions from '../../data/common/factions.json';
import campaignFactions from '../../data/common/campaign_factions.json';
import presets from '../../data/painter/presets';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  content: {
    padding: theme.spacing(2, 2),
    '& .MuiTextField-root': {
      margin: '0.5em 0',
    },
    '& .MuiFormControl-root': {
      margin: '0.5em 0',
    },
  },
}));

const PainterSection = () => {
  const classes = useStyles();

  const [selectedCampaign, setSelectedCampaign] = useState('3k_main_campaign_map');
  const selectedFaction = useStoreState((state) => state.painter.selectedFaction);
  const setSelectedFaction = useStoreActions((actions) => actions.painter.setSelectedFaction);

  const ownership = useStoreState((state) => state.painter.ownership);
  const setOwnership = useStoreActions((actions) => actions.painter.setOwnership);

  const allowedFactions = (campaignFactions as any)[selectedCampaign];
  const factionOptions = Object.values(factions).filter((entry) =>
    allowedFactions.includes(entry.key)
  );

  useEffect(() => {
    setSelectedFaction(null);
    setOwnership(presets[selectedCampaign]);
  }, [selectedCampaign]); // eslint-disable-line react-hooks/exhaustive-deps

  const overlays = useStoreState((state) => state.map.overlays);
  const selectOverlay = useStoreActions((actions) => actions.map.selectOverlay);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel>Chiến dịch đã chọn</InputLabel>
          <Select
            label="Chiến dịch đã chọn"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value as string)}
          >
            {campaigns.map((campaign) => (
              <MenuItem key={campaign.key} value={campaign.key}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FactionAutocomplete
          value={selectedFaction}
          options={factionOptions}
          onChange={(e, option) => setSelectedFaction(option ?? null)}
          label="Phe phái đã chọn"
          placeholder="Bỏ chọn"
          helperText="No faction selected abandons region."
        />
      </div>
      <Divider />
      <List subheader={<ListSubheader disableSticky>Hành động</ListSubheader>}>
        <ListItem dense button onClick={() => setOwnership(presets['clear'])}>
          <ListItemText primary={'Clear bản đồ'} />
        </ListItem>
        <ListItem dense button onClick={() => setOwnership(presets[selectedCampaign])}>
          <ListItemText primary={'Reset bản đồ'} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          dense
          button
          onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', '.json');

            fileInput.onchange = (e) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                // @ts-ignore
                const mapJson = JSON.parse(event.target.result);
                setOwnership(mapJson);
              };
              reader.onerror = (err) => console.log(err);
              // @ts-ignore
              reader.readAsText(e.target.files[0]);
            };

            fileInput.click();
          }}
        >
          <ListItemText primary={'Nhập'} secondary={'Click vào đây để nhập 1 map file'} />
        </ListItem>
        <ListItem
          dense
          button
          onClick={() => {
            const a = document.createElement('a');
            const json = JSON.stringify(ownership, null, 2);
            a.href = URL.createObjectURL(new Blob([json], { type: 'text/json' }));
            a.download = 'map.json';
            a.click();
          }}
        >
          <ListItemText primary={'Xuất'} secondary={'Click vào đây để xuất 1 map file'} />
        </ListItem>
      </List>
      <Divider />
      {Object.values(overlays).length === 3 && (
        <List subheader={<ListSubheader disableSticky>Lớp bản đồ</ListSubheader>}>
          <ListItem dense button onClick={() => selectOverlay('painter.ownership')}>
            <ListItemIcon>
              <Layers />
            </ListItemIcon>
            <ListItemText primary={'Chủ sở hữu'} />
            <ListItemSecondaryAction>
              <Radio
                color="primary"
                checked={overlays['painter.ownership'].visible}
                onChange={() => selectOverlay('painter.ownership')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem dense button onClick={() => selectOverlay('painter.resources')}>
            <ListItemIcon>
              <Layers />
            </ListItemIcon>
            <ListItemText primary={'Tài nguyên'} />
            <ListItemSecondaryAction>
              <Radio
                color="primary"
                checked={overlays['painter.resources'].visible}
                onChange={() => selectOverlay('painter.resources')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem dense button onClick={() => selectOverlay('painter.settlements')}>
            <ListItemIcon>
              <Layers />
            </ListItemIcon>
            <ListItemText primary={'Địa điểm định cư'} />
            <ListItemSecondaryAction>
              <Radio
                color="primary"
                checked={overlays['painter.settlements'].visible}
                onChange={() => selectOverlay('painter.settlements')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default PainterSection;

import React, { useState } from "react";
import Sprite from "../models/Sprite";
import { ImageCoordinates, SpriteDimensions } from "../util/types";

interface SpritePanelProps {
  onAddSprite: (
    position: ImageCoordinates,
    dimensions: SpriteDimensions
  ) => void;
  onRemoveSprite: (i: number) => void;
  onUpdatePaletteRow: () => void;
  sprites: Sprite[];
}

export default function SpritePanel({
  sprites,
  onAddSprite,
  onRemoveSprite,
  onUpdatePaletteRow,
}: SpritePanelProps) {
  const handleChangePaletteRow = (s: Sprite, n: number) => {
    s.paletteRow = n;
    onUpdatePaletteRow();
  };
  const renderSpriteList = (sprites: Sprite[]) =>
    sprites.map((s, i) => (
      <SpriteListItem
        sprite={s}
        i={i}
        onRemoveSprite={onRemoveSprite.bind(null, i)}
        onChangePaletteRow={handleChangePaletteRow.bind(null, s)}
      />
    ));

  return (
    <div>
      <div className="panel-header">Sprites</div>
      <div className="spritepanel-container">
        <NewSpriteForm onAddSprite={onAddSprite}></NewSpriteForm>
        <div className="sprite-list-container">
          {renderSpriteList(sprites)}
        </div>
      </div>
    </div>
  );
}

interface SpriteListItemProps {
  sprite: Sprite;
  i: number;
  onRemoveSprite: () => void;
  onChangePaletteRow: (newPaletteRow: number) => void;
}

function SpriteListItem({
  sprite,
  i,
  onRemoveSprite,
  onChangePaletteRow,
}: SpriteListItemProps) {
  const [paletteRow, setPaletteRow] = useState<number>(sprite.paletteRow);
  const handleChangePaletteRow = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const newRow = parseInt(e.target.value);
    if (newRow >= 0 && newRow <= 15) {
      setPaletteRow(newRow);
      onChangePaletteRow(newRow);
    }
  };
  return (
    <div className="sprite-list-content">
      <div key={i}>
        <div className="sprite-list-label">Sprite #{i}
          <button onClick={onRemoveSprite} className="x-button">x</button>
        </div>
        Position: ({sprite.position.x}, {sprite.position.y})
        <br /> 
        Dimensions: {sprite.dimensions.height}x{sprite.dimensions.width} px
        <br />
        <label>Palette Row: </label>
        <input
          className="row-num-input"
          // type="number"
          min={0}
          max={15}
          value={paletteRow}
          onChange={handleChangePaletteRow}
        ></input>
        <br />
        {/* <button onClick={onRemoveSprite}>X</button> */}
      </div>
    </div>
  );
}

interface NewSpriteFormProps {
  onAddSprite: (
    position: ImageCoordinates,
    dimensions: SpriteDimensions
  ) => void;
}

function NewSpriteForm({ onAddSprite }: NewSpriteFormProps) {
  // In terms of PIXELS
  const [dimensions, setDimensions] = useState<SpriteDimensions>({
    height: 8,
    width: 8,
  });
  // In terms of TILES
  const [position, setPosition] = useState<ImageCoordinates>({ x: 0, y: 0 });

  const handleSpriteHeightChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDimensions({
      height: parseInt(e.target.value),
      width: dimensions.width,
    } as SpriteDimensions);
  };

  const handleSpriteWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDimensions({
      width: parseInt(e.target.value),
      height: dimensions.height,
    } as SpriteDimensions);
  };

  const handlePosXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition({
      x: parseInt(e.target.value),
      y: position.y,
    });
  };

  const handlePosYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition({
      y: parseInt(e.target.value),
      x: position.x,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSprite(position, dimensions);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="spritepanel-label">Dimensions</div>
      <div className="sprite-input-container">
        <label htmlFor="sprite-height" className="spritepanel-label-dim">Height:</label>
        <select
          className="sprite-select"
          id="sprite-height"
          name="sprite-height"
          value={dimensions.height}
          onChange={handleSpriteHeightChange}
        >
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
        </select>
        <br />
        <label htmlFor="sprite-width" className="spritepanel-label-dim">Width:</label>
        <select
          className="sprite-select"
          id="sprite-width"
          name="sprite-width"
          value={dimensions.width}
          onChange={handleSpriteWidthChange}
        >
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
        </select>
      </div>
      <br />
      <div className="spritepanel-label">Position</div>
      <div className="sprite-input-container">
        <label htmlFor="sprite-pos-x" className="spritepanel-label-pos">X:</label>
        <input
          className="sprite-input"
          id="sprite-pos-x"
          name="sprite-pos-x"
          type="number"
          min={0}
          max={31}
          value={position.x}
          onChange={handlePosXChange}
        ></input>
        <label htmlFor="sprite-pos-y" className="spritepanel-label-pos">Y:</label>
        <input
          className="sprite-input"
          id="sprite-pos-y"
          name="sprite-pos-y"
          type="number"
          min={0}
          max={31}
          value={position.y}
          onChange={handlePosYChange}
        ></input>
      </div>
      <br />
      <button className="sprite-button">Add Sprite</button>
      {/* <div className="spritepanel-divider"></div> */}
      {/* <div className="spritepanel-label">Sprite List </div> */}
    </form>
  );
}

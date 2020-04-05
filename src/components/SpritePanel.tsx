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
    <div className="spritepanel-container">
      <div>Sprites</div>
      <NewSpriteForm onAddSprite={onAddSprite}></NewSpriteForm>
      {renderSpriteList(sprites)}
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
    <div key={i}>
      <strong>Sprite {i}: </strong>
      p:({sprite.position.x}, {sprite.position.y}), d:({sprite.dimensions.width}
      , {sprite.dimensions.height})<button onClick={onRemoveSprite}>X</button>
      <label>Row</label>
      <input
        type="number"
        min={0}
        max={15}
        value={paletteRow}
        onChange={handleChangePaletteRow}
      ></input>
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
      <label htmlFor="sprite-height">Height</label>
      <select
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
      <label htmlFor="sprite-width">Width</label>
      <select
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
      <br />
      <label htmlFor="sprite-pos-x">Pos X</label>
      <input
        id="sprite-pos-x"
        name="sprite-pos-x"
        type="number"
        min={0}
        max={31}
        value={position.x}
        onChange={handlePosXChange}
      ></input>
      <label htmlFor="sprite-pos-y">Pos Y</label>
      <input
        id="sprite-pos-y"
        name="sprite-pos-y"
        type="number"
        min={0}
        max={31}
        value={position.y}
        onChange={handlePosYChange}
      ></input>
      <br />
      <button>Add Sprite</button>
    </form>
  );
}

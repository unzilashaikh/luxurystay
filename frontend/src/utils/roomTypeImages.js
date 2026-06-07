/** Distinct fallback photos per room type when DB has no image */
export const ROOM_TYPE_IMAGES = {
  'Standard Twin':
    'https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Standard Queen':
    'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Deluxe King':
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Executive Room':
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Executive Suite':
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Presidential Suite':
    'https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

export const DEFAULT_ROOM_IMAGE =
  'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1200';

export const pickRoomImage = (room, typeFallback) => {
  if (room?.images?.[0]) return room.images[0];
  if (room?.type && ROOM_TYPE_IMAGES[room.type]) return ROOM_TYPE_IMAGES[room.type];
  if (typeFallback && ROOM_TYPE_IMAGES[typeFallback]) return ROOM_TYPE_IMAGES[typeFallback];
  return DEFAULT_ROOM_IMAGE;
};

export const pickTypeGroupImage = (rooms, type) => {
  const withImg = rooms.find((r) => r.images?.[0]);
  if (withImg) return withImg.images[0];
  return ROOM_TYPE_IMAGES[type] || DEFAULT_ROOM_IMAGE;
};

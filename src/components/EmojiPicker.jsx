const FITNESS_EMOJIS = [
  "\u{1F4AA}", // flexed biceps
  "\u{1F3CB}\uFE0F", // person lifting weights
  "\u{1F3C3}", // person running
  "\u{1F6B4}", // person biking
  "\u{1F938}", // person cartwheeling
  "\u{1F9D8}", // person in lotus position
  "\u{26F9}\uFE0F", // person bouncing ball
  "\u{1F3CA}", // person swimming
  "\u{1F9D7}", // person climbing
  "\u{1F93A}", // person fencing
  "\u{1F525}", // fire
  "\u{26A1}", // lightning
  "\u{1F4A5}", // collision
  "\u{2B50}", // star
  "\u{1F3AF}", // bullseye
  "\u{1F3C6}", // trophy
  "\u{1F947}", // first place medal
  "\u{1F948}", // second place medal
  "\u{2764}\uFE0F", // heart
  "\u{1F9B5}", // leg
  "\u{1F9B6}", // foot
  "\u{1F9BE}", // mechanical arm
  "\u{1F4A8}", // dashing away
  "\u{1F30A}", // wave
];

export default function EmojiPicker({ selected, onSelect }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-neutral-soft mb-2 block tracking-wider">
        Icon
      </label>
      <div className="grid grid-cols-8 gap-2">
        {FITNESS_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
              selected === emoji
                ? "bg-primary/20 ring-2 ring-primary scale-110"
                : "bg-neutral-soft/10 hover:bg-neutral-soft/20"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

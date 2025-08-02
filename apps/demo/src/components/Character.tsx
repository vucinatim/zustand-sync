import { type Character } from "../common/types";

type CharacterProps = {
  character: Character;
};

export function Character({ character }: CharacterProps) {
  return (
    <div
      style={{
        position: "absolute" as const,
        left: character.position.x,
        top: character.position.y,
        width: "48px",
        height: "48px",
        transform: "translate(-50%, -50%)",
      }}
      className={`${character.color} rounded-full shadow-2xl flex items-center justify-center text-white font-bold text-lg border-4 border-white/20 hover:border-white/40 transition-all duration-150 ease-out group`}
    >
      <span className="drop-shadow-lg">{character.name.charAt(0)}</span>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full ${character.color.replace(
          "bg-",
          "bg-"
        )} opacity-30 blur-sm scale-110`}
      />

      {/* Name label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {character.name}
      </div>
    </div>
  );
}

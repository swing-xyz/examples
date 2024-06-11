export const ChainTokenItem = ({
  logo,
  name,
  onItemSelect,
}: {
  logo: string;
  name: string;
  onItemSelect?: () => void | undefined;
}) => (
  <div
    className="flex justify-between p-3 hover:bg-zinc-300 hover:cursor-pointer rounded-xl"
    onClick={() => onItemSelect?.()}
  >
    <img src={logo} alt={name} className="w-8 h-8 rounded-full" />
    <span className="">{name}</span>
  </div>
);

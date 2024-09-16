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
    className="flex justify-between rounded-xl p-3 hover:cursor-pointer hover:bg-zinc-300"
    onClick={() => onItemSelect?.()}
  >
    <img src={logo} alt={name} className="h-8 w-8 rounded-full" />
    <span className="">{name}</span>
  </div>
);

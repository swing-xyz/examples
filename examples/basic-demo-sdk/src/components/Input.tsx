type Props = {
  onChange?: (e: any) => void;
};

const InputContainer: React.FC<Props> = ({ onChange = () => {} }) => (
  <input type="text" className="border rounded-xl p-2 text-right" placeholder="0.00" onChange={onChange} />
);

export default InputContainer;
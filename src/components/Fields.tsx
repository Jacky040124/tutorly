import { useId } from "react";
import { useTranslation } from 'react-i18next';

const formClasses =
  "block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm";

function Label({ id, children }: {id:string; children: React.ReactNode}) {
  return (
    <label
      htmlFor={id}
      className="mb-3 block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

export const InputField = ({ name, onChange, value }: {name: string; onChange: any; value: any}) => {
  const { t } = useTranslation('common');
  
  const generateTimeOptions = () => {
    const options = [];
    options.push(<option key="default">{t('fields.selectTime')}</option>);

    for (let hour = 6; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, "0");
      // Add hour:00
      options.push(<option key={`${hourStr}:00`}>{hourStr}:00</option>);
      // Add hour:30
      options.push(<option key={`${hourStr}:30`}>{hourStr}:30</option>);
    }

    return options;
  };

  return (
    <div>
      <label
        htmlFor="time"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {name}
      </label>
      <select
        onChange={onChange}
        value={value}
        id="time"
        name="time"
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        {generateTimeOptions()}
      </select>
    </div>
  );
};

export const ToggleField = ({ name, onChange, value }: {name: string; onChange: any; value: any}) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="flex items-center justify-between">
      <label
        htmlFor="repeating"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {name}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onChange}
        aria-label={t('fields.toggle.ariaLabel')}
        className={`${
          value ? "bg-green-600" : "bg-gray-200"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2`}
      >
        <span
          className={`${
            value ? "translate-x-5" : "translate-x-0"
          } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        >
          <span
            className={`${
              value
                ? "opacity-0 duration-100 ease-out"
                : "opacity-100 duration-200 ease-in"
            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={`${
              value
                ? "opacity-100 duration-200 ease-in"
                : "opacity-0 duration-100 ease-out"
            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-green-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
};


interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  type: string;
}

export const TextField: React.FC<TextFieldProps> = ({label,type, className, ...props}) => {
  let id = useId();

  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input id={id} type={type} className={formClasses} {...props} />
    </div>
  );
}


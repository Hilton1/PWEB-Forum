import { ClipLoader } from 'react-spinners';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, submitting }: ConfirmationModalProps) {
  const modalClassName = isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
  const modalStyle = isOpen ? {} : { pointerEvents: 'none' };

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-opacity duration-300 ${modalClassName}`} style={modalStyle}>
      <div className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 transform transition-transform duration-300 ${modalClassName}`}>
        <h2 className="text-2xl font-bold mb-4">Confirmar Exclusão</h2>
        <p className="mb-4">Tem certeza de que deseja excluir esta pergunta?</p>
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? <ClipLoader size={20} color="#ffffff" /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

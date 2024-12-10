import React from 'react';
import { FiEdit, FiEye } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  actions = [] // Empty array by default
}) => {
  const renderActionButton = (action, item) => {
    switch(action) {
      case 'edit':
        return onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <FiEdit className="w-5 h-5" />
          </button>
        );
      case 'delete':
        return onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <RiDeleteBin6Line className="w-5 h-5" />
          </button>
        );
      case 'view':
        return onView && (
          <button
            onClick={() => onView(item)}
            className="text-green-600 hover:text-green-900"
            title="View"
          >
            <FiEye className="w-5 h-5" />
          </button>
        );
      default:
        return null;
    }
  };

  const hasActions = actions.length > 0;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                 {column.render ? column.render(item) : item[column.field]}
                 
                </td>
              ))}
              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-3 justify-end">
                    {actions.map((action, index) => (
                      <React.Fragment key={index}>
                        {renderActionButton(action, item)}
                      </React.Fragment>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

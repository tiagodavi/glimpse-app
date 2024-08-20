import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropzone from './dropzone';
import '@testing-library/jest-dom';
import { ParseResult } from 'papaparse';

jest.mock('papaparse', () => ({
  parse: (
    file: File,
    {
      chunk,
      complete,
      error,
    }: {
      chunk: (result: ParseResult<any>) => void;
      complete: (result: ParseResult<any>) => void;
      error: (error: Error) => void;
    },
  ) => {
    const mockData = [
      { Name: 'Alice', Age: '30' },
      { Name: 'Bob', Age: '25' },
    ];

    chunk({ data: mockData, errors: [], meta: { cursor: 0 } });
    complete({ data: mockData, errors: [], meta: { cursor: 0 } });
  },
}));

describe('Dropzone Component', () => {
  test('renders Dropzone component', () => {
    render(<Dropzone />);
    expect(
      screen.getByText(
        /Drag 'n' drop a CSV file here, or click to select a file/i,
      ),
    ).toBeInTheDocument();
  });

  test('handles file drop and displays data', async () => {
    render(<Dropzone />);

    const file = new File(['Name,Age\nAlice,30\nBob,25'], 'test.csv', {
      type: 'text/csv',
    });
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
      expect(screen.getByText(/30/i)).toBeInTheDocument();
    });
  });

  test('selects a column and displays its type', async () => {
    render(<Dropzone />);

    const file = new File(['Name,Age\nAlice,30\nBob,25'], 'test.csv', {
      type: 'text/csv',
    });
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      const select = screen.getByLabelText(/Select Column/i);
      userEvent.click(select);

      userEvent.click(screen.getByText(/Age/i));

      waitFor(() => {
        expect(
          screen.getByText(/Data Type of Column: Numeric/i),
        ).toBeInTheDocument();
      });
    });
  });

  test('resets data when reset button is clicked', async () => {
    render(<Dropzone />);

    const file = new File(['Name,Age\nAlice,30\nBob,25'], 'test.csv', {
      type: 'text/csv',
    });
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();

      const resetButton = screen.getByRole('button', {
        name: /Upload Another CSV File/i,
      });
      userEvent.click(resetButton);

      waitFor(() => {
        expect(screen.queryByText(/Alice/i)).not.toBeInTheDocument();
      });
    });
  });
});

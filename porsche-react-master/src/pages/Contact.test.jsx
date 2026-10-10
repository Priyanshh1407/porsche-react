import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from './Contact';

// Fields are found by their visible labels, the way a user (or screen reader) finds them.
const fillRequiredFields = () => {
    const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
    set(/First Name/, 'Anna');
    set(/Last Name/, 'Schmidt');
    set(/^Email/, 'anna@example.com');
    set(/Phone Number/, '+15555550123');
    set(/Inquiry Type/, 'Sales');
    set(/^Message/, 'I would like to book a test drive this month.');
};
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

const renderContact = () => render(<MemoryRouter><Contact /></MemoryRouter>);

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Contact form (BUG-01)', () => {
    it('does not send untouched optional dropdowns as empty strings', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true, status: 201, json: async () => ({ success: true, data: { id: 'x' } }),
        });
        renderContact();
        fillRequiredFields();

        submit();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        // BUG-04: relative URL (dev proxy / REACT_APP_API_URL), never a hardcoded localhost.
        expect(fetchMock.mock.calls[0][0]).toBe('/api/contact/submit');
        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body).toEqual(expect.objectContaining({ firstName: 'Anna', inquiryType: 'Sales' }));
        expect(body).not.toHaveProperty('modelInterest');
        expect(body).not.toHaveProperty('preferredContactMethod');
        expect(body).not.toHaveProperty('preferredContactTime');
    });

    it('shows the API field errors under the matching input on a 400', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({
                success: false,
                errors: [{ path: 'phone', msg: 'Please enter a valid mobile number' }],
            }),
        });
        renderContact();
        fillRequiredFields();

        submit();

        expect(await screen.findByText('Please enter a valid mobile number')).toBeInTheDocument();
    });
});

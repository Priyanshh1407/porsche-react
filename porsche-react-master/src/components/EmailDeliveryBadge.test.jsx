// UPG-03: one glance tells the admin whether a lead's emails went out.
import { render, screen } from '@testing-library/react';
import EmailDeliveryBadge from './EmailDeliveryBadge';

const email = (kind, status, attempts = 1) => ({ kind, status, attempts });
const show = (emails) => render(<EmailDeliveryBadge emails={emails} />);

test.each([
    ['both sent', [email('customer_confirmation', 'sent'), email('admin_notification', 'sent')], 'Emails sent'],
    ['not attempted yet', [email('customer_confirmation', 'pending', 0), email('admin_notification', 'pending', 0)], 'Sending'],
    ['retrying', [email('customer_confirmation', 'sent'), email('admin_notification', 'pending', 2)], 'Retrying (2/5)'],
    ['one failed for good', [email('customer_confirmation', 'failed', 5), email('admin_notification', 'sent')], 'Email failed'],
])('%s -> "%s"', (_, emails, text) => {
    show(emails);
    expect(screen.getByText(text)).toBeInTheDocument();
});

test('a failed badge names which email failed (hover text)', () => {
    show([email('customer_confirmation', 'failed', 5), email('admin_notification', 'sent')]);
    expect(screen.getByTitle(/customer confirmation: failed after 5 attempts/)).toHaveTextContent('Email failed');
});

test('a lead from before the outbox existed shows a dash, not a false "sent"', () => {
    show([]);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/sent/i)).not.toBeInTheDocument();
});

export default function Badge({ status }) {
    const statusMap = {
        requested: 'badge-requested',
        accepted: 'badge-accepted',
        in_progress: 'badge-in_progress',
        completed: 'badge-completed',
        rejected: 'badge-rejected'
    };

    const displayMap = {
        requested: 'Requested',
        accepted: 'Accepted',
        in_progress: 'In Progress',
        completed: 'Completed',
        rejected: 'Rejected'
    };

    return (
        <span className={`badge ${statusMap[status] || 'badge-requested'}`}>
            {displayMap[status] || status}
        </span>
    );
}

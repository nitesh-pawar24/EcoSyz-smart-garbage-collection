export const complaintsData = [
  {
    id: 'C-01',
    dateSubmitted: '11/7/25',
    name: 'Mr. Naik',
    category: 'broken bin',
    ward: 'Ward 1',
    photo: true,
    status: 'Received',
    assignedEmployee: null,
  },
  {
    id: 'C-02',
    dateSubmitted: '10/7/25',
    name: 'Mr. Naik',
    category: 'garbage not collected',
    ward: 'Ward 2',
    photo: true,
    status: 'In Progress',
    assignedEmployee: 'R. Kumar',
  },
  {
    id: 'C-03',
    dateSubmitted: '9/9/25',
    name: 'Mr. Raikar',
    category: 'Overflowing waste',
    ward: 'Ward 3',
    photo: true,
    status: 'Resolved',
    assignedEmployee: 'A. Kumar',
  },
  {
    id: 'C-04',
    dateSubmitted: '8/9/25',
    name: 'Mr. Raikar',
    category: 'Others',
    ward: 'Ward 4',
    photo: false,
    status: 'Resolved',
    assignedEmployee: 'S. Kumar',
  },
]

export const complaintMetrics = {
  newComplaints: 1,
  pendingComplaints: 1,
  resolvedComplaints: 120,
}

export const employeesList = [
  { id: 1, name: 'R. Kumar' },
  { id: 2, name: 'A. Kumar' },
  { id: 3, name: 'S. Kumar' },
  { id: 4, name: 'P. Singh' },
  { id: 5, name: 'M. Sharma' },
]

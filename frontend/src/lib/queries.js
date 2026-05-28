import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
    retry: false,
  });
}

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  });
}

// Principles
export function usePrinciples() {
  return useQuery({
    queryKey: ['principles'],
    queryFn: () => api.get('/principles').then((r) => r.data),
  });
}

export function usePrinciple(id) {
  return useQuery({
    queryKey: ['principles', id],
    queryFn: () => api.get(`/principles/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

// Decisions
export function useDecisions() {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: () => api.get('/decisions').then((r) => r.data),
  });
}

export function useDecision(id) {
  return useQuery({
    queryKey: ['decisions', id],
    queryFn: () => api.get(`/decisions/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/decisions', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
}

export function useUpdateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/decisions/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      qc.invalidateQueries({ queryKey: ['decisions', id] });
    },
  });
}

export function useDeleteDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/decisions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Medical cases
export function useMedicalCases() {
  return useQuery({
    queryKey: ['medical-cases'],
    queryFn: () => api.get('/medical-cases').then((r) => r.data),
  });
}

export function useMedicalCase(id) {
  return useQuery({
    queryKey: ['medical-cases', id],
    queryFn: () => api.get(`/medical-cases/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateMedicalCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/medical-cases', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical-cases'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
}

export function useUpdateMedicalCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/medical-cases/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['medical-cases'] });
      qc.invalidateQueries({ queryKey: ['medical-cases', id] });
    },
  });
}

export function useDeleteMedicalCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/medical-cases/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical-cases'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Big Five
export function useBigFives() {
  return useQuery({
    queryKey: ['big-five'],
    queryFn: () => api.get('/big-five').then((r) => r.data),
  });
}

export function useBigFive(id) {
  return useQuery({
    queryKey: ['big-five', id],
    queryFn: () => api.get(`/big-five/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateBigFive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/big-five', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['big-five'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
}

export function useUpdateBigFive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/big-five/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['big-five'] });
      qc.invalidateQueries({ queryKey: ['big-five', id] });
    },
  });
}

export function useDeleteBigFive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/big-five/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['big-five'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Follow ups
export function useFollowUps(status) {
  return useQuery({
    queryKey: ['follow-ups', status],
    queryFn: () =>
      api.get('/follow-ups', { params: status ? { status } : {} }).then((r) => r.data),
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/follow-ups', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/follow-ups/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/follow-ups/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

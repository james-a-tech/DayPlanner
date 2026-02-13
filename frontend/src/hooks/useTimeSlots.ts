import { useMutation, useQuery } from '@tanstack/react-query';
import { timeSlotAPI } from '../api/client';

export const useTimeSlots = () => {
  return useQuery({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      const { data } = await timeSlotAPI.getTimeSlots();
      return data.data;
    },
  });
};

export const useCreateTimeSlot = () => {
  return useMutation({
    mutationFn: (data: any) => timeSlotAPI.createTimeSlot(data),
  });
};

export const useUpdateTimeSlot = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      timeSlotAPI.updateTimeSlot(id, data),
  });
};

export const useDeleteTimeSlot = () => {
  return useMutation({
    mutationFn: (id: string) => timeSlotAPI.deleteTimeSlot(id),
  });
};

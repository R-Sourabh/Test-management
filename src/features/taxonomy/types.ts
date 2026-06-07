export type Subject = {
  id: string;
  name: string;
};

export type Topic = {
  id: string;
  name: string;
  subjectId?: string;
  subject_id?: string;
};

export type SubTopic = {
  id: string;
  name: string;
  topicId?: string;
  topic_id?: string;
};

export type MultiTopicPayload = {
  topicIds: string[];
};

export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

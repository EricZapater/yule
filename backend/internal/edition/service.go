package edition

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetCurrentEdition() (*Edition, error) {
	return s.repo.GetOrCreateCurrentEdition()
}

func (s *Service) ListEditions() ([]Edition, error) {
	return s.repo.ListEditions()
}

func (s *Service) CreateEdition(input CreateEditionInput) (*Edition, error) {
	budget := input.BudgetLimit
	if budget <= 0 {
		budget = 30.0
	}
	return s.repo.CreateEdition(input.Year, input.Name, budget, input.CopyMembers)
}

func (s *Service) UpdateCurrentEdition(input UpdateEditionInput) (*Edition, error) {
	current, err := s.repo.GetOrCreateCurrentEdition()
	if err != nil {
		return nil, err
	}

	name := current.Name
	if input.Name != nil && *input.Name != "" {
		name = *input.Name
	}

	budget := current.BudgetLimit
	if input.BudgetLimit != nil && *input.BudgetLimit > 0 {
		budget = *input.BudgetLimit
	}

	return s.repo.UpdateEdition(current.ID, name, budget)
}
